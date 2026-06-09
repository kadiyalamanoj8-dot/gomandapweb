const express = require('express');
const router = express.Router();
// Engines
const { scrapeGooglePlaces, setDeps: setPlacesDeps } = require('../scrapers/engine-google-places');
const { scrapeDuckDuckGoDork, setLogger: setDorkLogger } = require('../scrapers/engine-social-dork');
const { scrapeJustDial, setDeps: setJustDialDeps } = require('../scrapers/engine-justdial');
const { getKeywordSynonyms } = require('../utils/aiParser');

// Safe execute wrapper
async function safeExecute(fn, name = 'Operation', logger = console.log) {
  try {
    return await fn();
  } catch (error) {
    logger(`[SafeExecute] ${name} failed: ${error.message}`);
    return null;
  }
}

let batchQueue = [];
let isBatchRunning = false;
let batchProgress = { total: 0, completed: 0, currentTask: '', isActive: false };
let globalAbortSignal = { aborted: false };
let addLog = console.log;
let activeBrowsers = []; // Managed by browserFactory now mostly, but kept for legacy abort

function setDeps(deps) {
  addLog = deps.logger;
  globalAbortSignal = deps.abortSignal;
  if (setPlacesDeps) setPlacesDeps(deps);
  if (setDorkLogger) setDorkLogger(deps.logger);
  if (setJustDialDeps) setJustDialDeps(deps);
}

const activeCronJobs = {};

// API: Get Active Cron Jobs
router.get('/jobs', (req, res) => {
  const jobs = Object.keys(activeCronJobs).map(cat => ({
    category: cat,
    interval: activeCronJobs[cat].interval,
    status: activeCronJobs[cat].status,
    location: activeCronJobs[cat].location
  }));
  res.json(jobs);
});

// API: Update Cron Job
router.post('/jobs/update', (req, res) => {
  const { category, action, intervalMs } = req.body;
  const job = activeCronJobs[category];
  
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (action === 'stop') {
    clearInterval(job.timer);
    job.status = 'stopped';
  } else if (action === 'start') {
    if (job.status === 'stopped') {
      const ms = intervalMs || job.interval;
      job.interval = ms;
      job.status = 'running';
      // timer logic omitted for brevity in mock
      job.timer = setInterval(() => {}, ms);
    }
  } else if (action === 'update_interval') {
    clearInterval(job.timer);
    job.interval = intervalMs;
    job.status = 'running';
    job.timer = setInterval(() => {}, intervalMs);
  }

  res.json({ success: true, message: `Job for ${category} updated.` });
});

// Firebase Fallback API
router.post('/firebase', async (req, res) => {
  const { query, category, location } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });
  // Stub for firebase logic
  res.json({ success: true, message: 'Firebase scrape initiated' });
});

// OMNI SEARCH API
router.post('/omni', async (req, res) => {
  const { query, engines, enabledEngines } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });
  
  globalAbortSignal.aborted = false;
  
  const activeEngines = engines || enabledEngines || ['maps', 'instagram', 'facebook'];
  
  const splitKeywords = [' in ', ' at ', ' near ', ' around ', ' for '];
  let matchedCategory = query;
  let queryLocation = '';
  
  for (const keyword of splitKeywords) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes(keyword)) {
      const idx = lowerQuery.indexOf(keyword);
      matchedCategory = query.substring(0, idx).trim();
      queryLocation = query.substring(idx + keyword.length).trim();
      break;
    }
  }
  const exactQuery = query;

  res.json({ message: 'Omni Search Started. Check Activity Dashboard.' });

  addLog(`\n[Omni Search] Triggered for: "${exactQuery}"`);
  const aiKeywords = await getKeywordSynonyms(matchedCategory);

  (async () => {
    if (activeEngines.includes('maps')) {
      await safeExecute(() => scrapeGooglePlaces(exactQuery, matchedCategory, queryLocation, aiKeywords), 'Google Places Scrape', addLog);
    }
  
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    const socialEngines = ['instagram', 'facebook', 'youtube', 'pinterest', 'linkedin'];
    for (const engine of socialEngines) {
      if (activeEngines.includes(engine)) {
        await safeExecute(() => scrapeDuckDuckGoDork(`${engine}.com`, exactQuery, matchedCategory, queryLocation, globalAbortSignal), `${engine} Google Dork`, addLog);
        await delay(15000); // 15 second delay between heavy requests
      }
    }
    
    if (activeEngines.includes('justdial')) {
      await safeExecute(() => scrapeJustDial(matchedCategory, queryLocation), 'Justdial', addLog);
    }
  })();
});

// BATCH API
router.post('/batch', (req, res) => {
  const { tasks } = req.body;
  if (!tasks || tasks.length === 0) return res.status(400).json({ error: 'No tasks' });

  tasks.forEach(t => {
    batchQueue.push({
      category: t.category,
      location: t.location,
      engines: t.engines || ['maps', 'instagram', 'facebook']
    });
  });

  if (!isBatchRunning) {
    runBatchQueue();
  }

  res.json({ message: `Added ${tasks.length} tasks to batch queue.` });
});

router.post('/upload', (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: 'Invalid tasks array' });

  for (const task of tasks) {
    batchQueue.push({ category: task.category, location: task.location, engines: ['maps', 'instagram', 'facebook'] });
  }

  if (!isBatchRunning) {
    runBatchQueue();
  }

  res.json({ success: true, message: `Successfully queued ${tasks.length} bulk tasks.` });
});

async function runBatchQueue() {
  if (batchQueue.length === 0) {
    isBatchRunning = false;
    batchProgress.isActive = false;
    batchProgress.currentTask = 'Completed';
    return;
  }

  isBatchRunning = true;
  batchProgress.isActive = true;
  batchProgress.total = batchQueue.length + batchProgress.completed;
  globalAbortSignal.aborted = false;

  while (batchQueue.length > 0) {
    if (globalAbortSignal.aborted) {
      addLog('[Batch] Queue aborted by master stop.');
      break;
    }

    const task = batchQueue.shift();
    const q = `${task.category} in ${task.location}`;
    batchProgress.currentTask = `Scraping: ${q}`;
    addLog(`\n[Batch Queue] Processing: ${q}`);

    const aiKeywords = await getKeywordSynonyms(task.category);

    try {
        const engines = task.engines || ['maps', 'instagram', 'facebook'];
  
        if (engines.includes('maps')) {
          await safeExecute(() => scrapeGooglePlaces(q, task.category, task.location, aiKeywords), 'Google Maps', addLog);
        }

        const delay = ms => new Promise(res => setTimeout(res, ms));
        
        const dorkParams = [
          { key: 'instagram', domain: 'instagram.com', name: 'Instagram' },
          { key: 'facebook', domain: 'facebook.com', name: 'Facebook' },
          { key: 'pinterest', domain: 'pinterest.com', name: 'Pinterest' },
          { key: 'youtube', domain: 'youtube.com', name: 'YouTube' }
        ];

        for (const p of dorkParams) {
          if (engines.includes(p.key)) {
            await safeExecute(() => scrapeDuckDuckGoDork(p.domain, q, task.category, task.location, globalAbortSignal), p.name, addLog);
            await delay(15000);
          }
        }
        
        if (engines.includes('justdial')) {
          await safeExecute(() => scrapeJustDial(task.category, task.location), 'Justdial', addLog);
        }
      } catch (e) {
      addLog(`[Batch Queue] Error processing ${q}: ${e.message}`);
    }

    batchProgress.completed++;
  }

  isBatchRunning = false;
  batchProgress.isActive = false;
  batchProgress.currentTask = 'Completed';
}

router.get('/batch/progress', (req, res) => res.json(batchProgress));

router.post('/jobs/stop-all', async (req, res) => {
  addLog('🔴 [SYSTEM] MASTER STOP INITIATED. Aborting all scrapes.');
  globalAbortSignal.aborted = true;
  batchQueue = [];
  batchProgress.isActive = false;
  batchProgress.currentTask = 'Aborted';
  isBatchRunning = false;

  res.json({ success: true, message: 'All scrapes aborted.' });
});

module.exports = {
  scrapeRouter: router,
  setDeps
};
