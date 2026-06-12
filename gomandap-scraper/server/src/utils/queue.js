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
// Capped at 1 for ultra-stable sequential scraping as requested by the user
const CONCURRENCY = 1;

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
      
      const instanceId = Math.random().toString(36).substr(2, 5).toUpperCase();
      
      // Fire and forget, but handle completion/error
      processJob(job, instanceId).finally(() => {
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
  memoryQueue.push({ taskName, args, priority, meta });
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
