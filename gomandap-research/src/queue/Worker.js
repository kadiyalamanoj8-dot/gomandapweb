const { runDeepCrawler } = require('../crawler/DeepCrawler');
const { analyzeAndSummarize } = require('../ai/Analyzer');
const fs = require('fs');
const path = require('path');

async function runJob(job) {
  job.state = 'active';
  const { query, deepCrawl } = job;
  console.log(`[Job ${job.id}] Starting deep research for query: "${query}"`);

  // Step 1: Crawl
  job.progress = 5;
  const dataItems = await runDeepCrawler(query, job.id, async (p) => {
    job.progress = 10 + Math.floor((p / 100) * 40);
  });

  console.log(`[Job ${job.id}] Crawled ${dataItems.length} items. Processing AI summary...`);
  job.progress = 50;

  // Step 2: AI Summarize
  const report = await analyzeAndSummarize(dataItems, async (p) => {
    job.progress = p;
  });

  console.log(`[Job ${job.id}] AI Research Complete.`);

  // Save Report
  const reportPath = path.join(__dirname, '../../downloads', `report_${job.id}.md`);
  fs.writeFileSync(reportPath, report);

  job.result = {
    itemsCount: dataItems.length,
    reportPath: `/downloads/report_${job.id}.md`,
    report,
    dataItems
  };
  job.state = 'completed';
  job.progress = 100;
}

module.exports = { runJob };
