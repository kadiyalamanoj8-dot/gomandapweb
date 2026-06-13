// Persistent Queue to replace BullMQ and Redis (Removes ECONNREFUSED 127.0.0.1:6379 errors)
const fs = require('fs');
const path = require('path');

const JOBS_FILE = path.join(__dirname, '../../data/jobs.json');

// Ensure jobs file exists
if (!fs.existsSync(path.dirname(JOBS_FILE))) {
  fs.mkdirSync(path.dirname(JOBS_FILE), { recursive: true });
}
if (!fs.existsSync(JOBS_FILE)) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
}

let globalDeps = {
  logger: console.log,
  abortSignal: { aborted: false }
};

function initQueue(deps) {
  globalDeps = { ...globalDeps, ...deps };
  // Resume any jobs that were pending/running when the server restarted
  setTimeout(processQueue, 2000); 
}

// Map of task types to actual execution functions
const taskRegistry = {};

function registerTask(name, fn) {
  taskRegistry[name] = fn;
}

function getPersistentQueue() {
  try {
    return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8')) || [];
  } catch (e) {
    return [];
  }
}

function savePersistentQueue(queueData) {
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(queueData, null, 2));
  } catch (e) {
    console.error('[Queue] Failed to save queue state:', e);
  }
}

let isProcessing = false;
let activeCount = 0;
// Capped at 1 for ultra-stable sequential scraping
const CONCURRENCY = 1;

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (activeCount < CONCURRENCY) {
    if (globalDeps.abortSignal.aborted) {
      savePersistentQueue([]); // Clear queue on abort
      globalDeps.logger(`[Queue] Queue cleared due to master abort.`);
      break;
    }

    const queue = getPersistentQueue();
    if (queue.length === 0) break;

    // Shift the first job off the disk queue
    const job = queue.shift();
    savePersistentQueue(queue); // Update disk state immediately
    
    activeCount++;
    const instanceId = Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Fire and forget, but handle completion/error
    processJob(job, instanceId).finally(() => {
      activeCount--;
      // Trigger next process loop without blowing up stack
      setImmediate(processQueue);
    });
  }

  isProcessing = false;
}

async function processJob(job, instanceId) {
  const { taskName, args, meta } = job;
  const fn = taskRegistry[taskName];

  if (!fn) {
    globalDeps.logger(`[Instance-${instanceId} Error] Task ${taskName} not registered.`);
    return;
  }

  globalDeps.logger(`\n[Instance-${instanceId}] Starting ${taskName}...`);
  if (meta && globalDeps.emitActivePointEvent) {
    globalDeps.emitActivePointEvent({ ...meta, instanceId });
  }

  try {
    const timeoutMs = 180000; // 3 minutes hard limit
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Job timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    await Promise.race([
      fn(...args),
      timeoutPromise
    ]);
    globalDeps.logger(`[Instance-${instanceId}] Job ${taskName} completed successfully.`);
  } catch (err) {
    globalDeps.logger(`[Instance-${instanceId} Error] ${taskName} failed: ${err.message}`);
  }
}

async function addScrapeJob(taskName, args, priority = 10, meta = null) {
  const queue = getPersistentQueue();
  queue.push({ taskName, args, priority, meta });
  queue.sort((a, b) => b.priority - a.priority);
  savePersistentQueue(queue);
  
  processQueue(); // Kick off processing if not already running
}

async function clearQueue() {
  savePersistentQueue([]);
  globalDeps.logger(`[Queue] Persistent queue obliterated.`);
}

module.exports = {
  initQueue,
  registerTask,
  addScrapeJob,
  clearQueue
};
