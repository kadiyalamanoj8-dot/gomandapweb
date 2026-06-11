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

// Configs
const localDb = require('./src/config/localDb');

// Routes
const authRoutes = require('./src/routes/auth');
const { apiRouter, setLogGetter } = require('./src/routes/api');
const { scrapeRouter, setDeps } = require('./src/routes/scrape');
const vendorsRoutes = require('./src/routes/vendors');
const employeesRoutes = require('./src/routes/employees');
const uploadRoutes = require('./src/routes/upload');

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
  } catch (e) { console.error('Failed to emit vendor SSE', e.message); }
}

// Database is now completely local and loads synchronously.

// Global Abort Signal
let globalAbortSignal = { aborted: false };

// Inject dependencies into routers
setLogGetter(() => systemLogs);
setDeps({ logger: addLog, abortSignal: globalAbortSignal, emitVendorEvent });

// Apply Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/upload', uploadRoutes);

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
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Gomandap Omni Scraper backend running on port ${PORT}`);
});
