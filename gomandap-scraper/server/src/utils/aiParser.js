const { pipeline } = require('@xenova/transformers');
const Fuse = require('fuse.js');
let classifier = null;

async function loadAIModel() {
  try {
    if (!classifier) {
      console.log('[AI Model] Loading DistilBERT Zero-Shot Classifier (Offline/Local)...');
      classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli', {
        quantized: true 
      });
      console.log('[AI Model] Successfully loaded.');
    }
  } catch (err) {
    console.error('[AI Model] Failed to load Transformers.js:', err.message);
  }
}

// Kick off loading immediately so it's ready before first scrape
loadAIModel();

async function getKeywordSynonyms(category) {
  try {
    const res = await require('axios').get(`https://api.datamuse.com/words?ml=${encodeURIComponent(category)}`);
    const words = res.data.slice(0, 8).map(w => w.word);
    
    const coreTerms = category.split(/[\s&/]+/).filter(w => w.length > 3);
    const combined = [...new Set([...words, ...coreTerms, category])];
    
    // Fallback dictionary for Indian context
    if (category.toLowerCase().includes('mandap') || category.toLowerCase().includes('banquet') || category.toLowerCase().includes('hall')) {
      combined.push('kalyana', 'mandapamu', 'function', 'shadi', 'khana', 'convention', 'arena');
    }
    
    return combined;
  } catch (error) {
    return [category, ...category.split(' ')];
  }
}

async function verifyWithAI(vendorName, htmlContent, expectedCategory, aiKeywords = []) {
  if (!htmlContent || htmlContent.length < 50) return false;
  
  const cleanHtml = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').toLowerCase();
  
  // 1. Exact/Fuzzy Keyword Match Engine
  let foundKeywords = [];
  let fuse = new Fuse(cleanHtml.split(' '), { includeScore: true, threshold: 0.3 });
  
  for (const keyword of aiKeywords) {
    if (cleanHtml.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    } else {
      const fuzzyResult = fuse.search(keyword.toLowerCase());
      if (fuzzyResult.length > 0) foundKeywords.push(keyword);
    }
  }

  if (foundKeywords.length > 0) {
    return true;
  }

  // 2. Heavy AI Fallback 
  if (classifier) {
    try {
      const textToAnalyze = cleanHtml.substring(0, 1500); 
      const results = await classifier(textToAnalyze, [expectedCategory, ' unrelated business ', ' random blog ']);
      
      const categoryScore = results.scores[results.labels.indexOf(expectedCategory)];
      if (categoryScore > 0.4) {
        return true;
      }
    } catch (e) {
      console.warn(`[AI Parser] Transformers.js failed for ${vendorName}:`, e.message);
    }
  }

  return false;
}

module.exports = {
  loadAIModel,
  getKeywordSynonyms,
  verifyWithAI
};
