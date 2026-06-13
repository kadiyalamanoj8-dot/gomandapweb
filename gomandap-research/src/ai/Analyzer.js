const { pipeline, env } = require('@xenova/transformers');

// Prevent downloading to system directories, use local cache
env.localModelPath = './models';
env.allowRemoteModels = true;

let summarizer = null;

async function initAI() {
  if (!summarizer) {
    console.log('Loading Hugging Face Summarizer Model...');
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
      quantized: true // Use smaller, faster version
    });
    console.log('Summarizer Model Loaded.');
  }
}

async function analyzeAndSummarize(items, updateProgress) {
  await initAI();
  
  let fullReport = `# AI Research Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  let processed = 0;

  for (const item of items) {
    if (!item.content || item.content.length < 100) continue;

    try {
      // Grab the first 2000 chars for summarization to fit context window
      const textChunk = item.content.substring(0, 2000);
      
      const result = await summarizer(textChunk, {
        max_new_tokens: 150,
        min_length: 30,
      });

      const summary = result[0].summary_text;

      fullReport += `## Source: ${item.title || item.url}\n`;
      fullReport += `**Type**: ${item.type}\n`;
      fullReport += `**Summary**: ${summary}\n\n`;
      fullReport += `---\n\n`;
    } catch (e) {
      console.warn(`Failed to summarize item: ${item.title}`, e.message);
    }

    processed++;
    if (updateProgress) {
      // Progress from 50% to 100%
      updateProgress(50 + Math.floor((processed / items.length) * 50));
    }
  }

  return fullReport;
}

module.exports = { analyzeAndSummarize };
