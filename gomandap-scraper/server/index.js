const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs');

// Environment setup
const backendEnvPath = path.join(__dirname, '../../backend/.env');
if (fs.existsSync(backendEnvPath)) {
  require('dotenv').config({ path: backendEnvPath });
} else {
  require('dotenv').config();
}

// Global Exception Handlers to prevent Playwright crashes
process.on('uncaughtException', (err) => {
  console.error('[Global] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Global] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Configs
const localDb = require('./src/config/localDb');

// Routes
const authRoutes = require('./src/routes/auth');
const { apiRouter, setLogGetter } = require('./src/routes/api');
const { scrapeRouter, setDeps } = require('./src/routes/scrape');
const vendorsRoutes = require('./src/routes/vendors');
const employeesRoutes = require('./src/routes/employees');
const uploadRoutes = require('./src/routes/upload');
const publicUsersRoutes = require('./src/routes/publicUsers');
const locationsRoutes = require('./src/routes/locations');

const app = express();
app.use(cors());
app.use(express.json());

// System Logging State & SSE
let systemLogs = [];
let sseClients = [];

function sendSse(msg) {
  const safe = msg.replace(/\n/g, '\\n');
  sseClients.forEach(res => {
    try { res.write(`data: ${safe}\n\n`); } catch (e) {}
  });
}

function addLog(msg) {
  console.log(msg);
  systemLogs.push(msg);
  if (systemLogs.length > 50) systemLogs.shift();
  sendSse(msg);
}

function emitVendorEvent(vendorObj, action = 'inserted') {
  try {
    const payload = { action, vendor: vendorObj };
    const safe = JSON.stringify(payload).replace(/\n/g, '\\n');
    sseClients.forEach(res => {
      try { res.write('event: vendor\n'); res.write(`data: ${safe}\n\n`); } catch (e) {}
    });

    // Automatically trigger Deep Crawl if contact info is missing
    if (action === 'inserted' && vendorObj.website && (!vendorObj.phone || !vendorObj.email)) {
      if (vendorObj.website.startsWith('http') && !vendorObj.website.includes('instagram.com') && !vendorObj.website.includes('facebook.com')) {
        const { addScrapeJob } = require('./src/utils/queue');
        addLog(`[Deep Scan System] Vendor ${vendorObj.name} lacks phone/email. Queuing deep crawl of ${vendorObj.website}`);
        addScrapeJob('scrapeCrawleeDeep', [vendorObj.website, vendorObj.name, vendorObj.category, vendorObj.city]);
      }
    }
  } catch (e) { console.error('Failed to emit vendor SSE', e.message); }
}

function emitGridEvent(gridCoords) {
  try {
    const safe = JSON.stringify(gridCoords).replace(/\n/g, '\\n');
    sseClients.forEach(res => {
      try { res.write('event: grid_points\n'); res.write(`data: ${safe}\n\n`); } catch (e) {}
    });
  } catch (e) { console.error('Failed to emit grid SSE', e.message); }
}

function emitInterventionEvent(platformName, isActive) {
  try {
    const payload = { platform: platformName, active: isActive };
    const safe = JSON.stringify(payload).replace(/\n/g, '\\n');
    sseClients.forEach(res => {
      try { res.write('event: intervention\n'); res.write(`data: ${safe}\n\n`); } catch (e) {}
    });
  } catch (e) { console.error('Failed to emit intervention SSE', e.message); }
}

function emitDispatchEvent(targets) {
  try {
    const safe = JSON.stringify(targets).replace(/\n/g, '\\n');
    sseClients.forEach(res => {
      try { res.write('event: dispatch_targets\n'); res.write(`data: ${safe}\n\n`); } catch (e) {}
    });
  } catch (e) { console.error('Failed to emit dispatch_targets SSE', e.message); }
}

function emitActivePointEvent(pointInfo) {
  try {
    const safe = JSON.stringify(pointInfo).replace(/\n/g, '\\n');
    sseClients.forEach(res => {
      try { res.write('event: active_point\n'); res.write(`data: ${safe}\n\n`); } catch (e) {}
    });
  } catch (e) { console.error('Failed to emit active_point SSE', e.message); }
}

function emitProgressEvent(progressInfo) {
  try {
    const safe = JSON.stringify(progressInfo).replace(/\n/g, '\\n');
    sseClients.forEach(res => {
      try { res.write('event: progress\n'); res.write(`data: ${safe}\n\n`); } catch (e) {}
    });
  } catch (e) { console.error('Failed to emit progress SSE', e.message); }
}

// Database is now completely local and loads synchronously.

// Initialize the job queue
const { initQueue } = require('./src/utils/queue');
initQueue({ logger: addLog, emitVendorEvent, emitActivePointEvent });

// Global Abort Signal
let globalAbortSignal = { aborted: false };

// Inject dependencies into routers
setLogGetter(() => systemLogs);
setDeps({ logger: addLog, abortSignal: globalAbortSignal, emitVendorEvent, emitGridEvent, emitActivePointEvent, emitInterventionEvent, emitDispatchEvent, emitProgressEvent });
const { setInterventionEmitter } = require('./src/utils/manualIntervention');
setInterventionEmitter(emitInterventionEvent);

// Apply Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/public', publicUsersRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/locations', locationsRoutes);

// Static PDF Downloads
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Log Streaming Route
app.get('/api/logs/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('event: init\n');
  res.write(`data: ${JSON.stringify(systemLogs).replace(/\n/g, '\\n')}\n\n`);

  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter(r => r !== res);
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  require('fs').appendFileSync('error_crash.log', err.stack + '\\n');
  res.status(500).json({ error: 'Internal Server Error' });
});

// Always use 5002 internally since it is proxied by the main backend
const PORT = 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Gomandap Omni Scraper backend running on port ${PORT}`);
});
