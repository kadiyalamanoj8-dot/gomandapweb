require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Expose downloaded files
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

let sseClients = [];
function broadcastLog(msg) {
  const safe = msg.replace(/\n/g, '\\n');
  sseClients.forEach(client => {
    try { client.write(`data: ${safe}\n\n`); } catch(e) {}
  });
}

// In-memory queue
const jobs = new Map();
const queue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  
  const job = queue.shift();
  try {
    // Inject the SSE broadcaster into the worker globally or via an event system.
    // For now, we will override console.log in the worker context
    const originalLog = console.log;
    console.log = (...args) => {
      const msg = args.join(' ');
      broadcastLog(msg);
      originalLog.apply(console, args);
    };
    
    await require('./src/queue/Worker').runJob(job);
    
    console.log = originalLog; // Restore
  } catch(e) {
    console.error('Job failed', e);
    jobs.get(job.id).state = 'failed';
    broadcastLog(`[ERROR] Job failed: ${e.message}`);
  }
  
  isProcessing = false;
  processQueue();
};

app.post('/api/research/start', async (req, res) => {
  const { query, deepCrawl } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const jobId = Date.now().toString();
  const job = { id: jobId, query, deepCrawl, state: 'waiting', progress: 0, result: null };
  jobs.set(jobId, job);
  queue.push(job);
  
  processQueue(); // trigger processing
  
  res.json({ message: 'Research started', jobId });
});

app.get('/api/research/status/:jobId', async (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  
  res.json({ state: job.state, progress: job.progress, result: job.result });
});

app.get('/api/research/logs/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('event: init\n');
  res.write(`data: Connected to AI Brain...\n\n`);

  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter(r => r !== res);
  });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Gomandap AI Research Engine running on port ${PORT}`);
});
