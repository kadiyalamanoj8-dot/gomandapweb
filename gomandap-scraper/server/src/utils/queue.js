// In-Memory Queue to replace BullMQ and Redis (Removes ECONNREFUSED 127.0.0.1:6379 errors)

let globalDeps = {
  logger: console.log,
  abortSignal: { aborted: false }
};

function initQueue(deps) {
  globalDeps = { ...globalDeps, ...deps };
}

// Map of task types to actual execution functions
const taskRegistry = {};

function registerTask(name, fn) {
  taskRegistry[name] = fn;
}

const memoryQueue = [];
let isProcessing = false;
let activeCount = 0;
const os = require('os');
// Moderate CPU utilization to prevent overloading system when running multiple browsers
const CONCURRENCY = 4;

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (memoryQueue.length > 0 || activeCount > 0) {
    if (globalDeps.abortSignal.aborted) {
      memoryQueue.length = 0; // Clear queue
      globalDeps.logger(`[Queue] Queue cleared due to master abort.`);
      break;
    }

    if (activeCount < CONCURRENCY && memoryQueue.length > 0) {
      const job = memoryQueue.shift();
      activeCount++;
      
      // Fire and forget, but handle completion/error
      processJob(job).finally(() => {
        activeCount--;
        // Trigger next process loop without blowing up stack
        setImmediate(processQueue);
      });
    } else {
      // Either queue is empty but things are running, or we hit concurrency limit
      // Just break this loop, the `finally` block above will restart it
      break;
    }
  }

  isProcessing = false;
}

async function processJob(job) {
  const { taskName, args } = job;
  const fn = taskRegistry[taskName];

  if (!fn) {
    globalDeps.logger(`[Queue Error] Task ${taskName} not registered.`);
    return;
  }

  globalDeps.logger(`\n[Queue] Processing ${taskName}...`);
  try {
    await fn(...args);
    globalDeps.logger(`[Queue] Job ${taskName} completed.`);
  } catch (err) {
    globalDeps.logger(`[Queue Error] ${taskName} failed: ${err.message}`);
  }
}

async function addScrapeJob(taskName, args, priority = 10) {
  memoryQueue.push({ taskName, args, priority });
  // Sort descending if priority is important, but simple append is usually fine for this use case
  memoryQueue.sort((a, b) => b.priority - a.priority);
  
  processQueue(); // Kick off processing if not already running
}

async function clearQueue() {
  memoryQueue.length = 0;
  globalDeps.logger(`[Queue] Memory queue obliterated.`);
}

module.exports = {
  initQueue,
  registerTask,
  addScrapeJob,
  clearQueue
};
