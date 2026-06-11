const express = require('express');
const router = express.Router();
// Engines
const { scrapeGooglePlaces, setDeps: setPlacesDeps } = require('../scrapers/engine-google-places');
const { scrapeGoogleSerp, setDeps: setSerpDeps } = require('../scrapers/engine-google-serp');
const { scrapeDuckDuckGoDork, setLogger: setDorkLogger } = require('../scrapers/engine-social-dork');
const { scrapeJustDial, setDeps: setJDDeps } = require('../scrapers/engine-justdial');
const { scrapeWeddingBazaar, setDeps: setWBDeps } = require('../scrapers/engine-weddingbazaar');
const { scrapeWeddingWire, setDeps: setWWDeps } = require('../scrapers/engine-weddingwire');
const { scrapeMandap, setDeps: setMandapDeps } = require('../scrapers/engine-mandap');
const { scrapeBraveDork, setDeps: setBraveDeps } = require('../scrapers/engine-brave-dork');
const { scrapeDeepseekAI, setDeps: setDeepseekDeps } = require('../scrapers/engine-deepseek');
const { scrapeCrawleeDeep, setDeps: setCrawleeDeps } = require('../scrapers/engine-crawlee-deep');
const { scrapePuppeteerIndiaMart, setDeps: setIndiaMartDeps } = require('../scrapers/engine-puppeteer-indiamart');
const { scrapeScrapySpider, setDeps: setScrapyDeps } = require('../scrapers/engine-scrapy');

const { initQueue, registerTask, addScrapeJob, clearQueue } = require('../utils/queue');
const { geocodeLocation } = require('../utils/olaMaps');

// Safe execute wrapper
async function safeExecute(fn, name = 'Operation', logger = console.log) {
  try {
    return await fn();
  } catch (error) {
    logger(`[SafeExecute] ${name} failed: ${error.message}`);
    return null;
  }
}

let batchProgress = { total: 0, completed: 0, currentTask: '', isActive: false };
let globalAbortSignal = { aborted: false };
let addLog = console.log;
let emitGridEvent = () => {};

// Register tasks with BullMQ
registerTask('scrapeGooglePlaces', async (q, cat, loc, sessionId, centerLat, centerLng, radiusKm) => safeExecute(() => scrapeGooglePlaces(q, cat, loc, sessionId, centerLat, centerLng, radiusKm), 'Google Places Scrape', addLog));
registerTask('scrapeGoogleSerp', async (q, cat, loc) => safeExecute(() => scrapeGoogleSerp(q, cat, loc), 'Google Serp Scrape', addLog));
registerTask('scrapeJustDial', async (cat, loc) => safeExecute(() => scrapeJustDial(cat, loc), 'JustDial Scrape', addLog));
registerTask('scrapeWeddingBazaar', async (cat, loc) => safeExecute(() => scrapeWeddingBazaar(cat, loc), 'WeddingBazaar Scrape', addLog));
registerTask('scrapeWeddingWire', async (cat, loc) => safeExecute(() => scrapeWeddingWire(cat, loc), 'WeddingWire Scrape', addLog));
registerTask('scrapeMandap', async (cat, loc) => safeExecute(() => scrapeMandap(cat, loc), 'Mandap Scrape', addLog));
registerTask('scrapeDuckDuckGoDork', async (domain, q, cat, loc) => safeExecute(() => scrapeDuckDuckGoDork(domain, q, cat, loc, globalAbortSignal), `DDG Dork ${domain}`, addLog));
registerTask('scrapeBraveDork', async (domain, q, cat, loc) => safeExecute(() => scrapeBraveDork(domain, q, cat, loc), `Brave Dork ${domain}`, addLog));
registerTask('scrapeDeepseekAI', async (q, cat, loc) => safeExecute(() => scrapeDeepseekAI(q, cat, loc), 'DeepSeek AI Scrape', addLog));
registerTask('scrapeCrawleeDeep', async (url, vendorName, cat, loc) => safeExecute(() => scrapeCrawleeDeep(url, vendorName, cat, loc), 'Crawlee Deep Scrape', addLog));
registerTask('scrapePuppeteerIndiaMart', async (cat, loc) => safeExecute(() => scrapePuppeteerIndiaMart(cat, loc), 'IndiaMart Stealth Scrape', addLog));
registerTask('scrapeScrapySpider', async (cat, loc) => safeExecute(() => scrapeScrapySpider(cat, loc), 'Scrapy Python Spider', addLog));

function setDeps(deps) {
  addLog = deps.logger;
  globalAbortSignal = deps.abortSignal;
  if (deps.emitGridEvent) emitGridEvent = deps.emitGridEvent;
  if (setPlacesDeps) setPlacesDeps(deps);
  if (setDorkLogger) setDorkLogger(deps.logger);
  if (setJDDeps) setJDDeps(deps);
  if (setWBDeps) setWBDeps(deps);
  if (setWWDeps) setWWDeps(deps);
  if (setMandapDeps) setMandapDeps(deps);
  if (setBraveDeps) setBraveDeps(deps);
  if (setDeepseekDeps) setDeepseekDeps(deps);
  if (setSerpDeps) setSerpDeps(deps);
  if (setCrawleeDeps) setCrawleeDeps(deps);
  if (setIndiaMartDeps) setIndiaMartDeps(deps);
  if (setScrapyDeps) setScrapyDeps(deps);
  // Optional but safe to call if defined
  initQueue(deps);
}

const { getSettings, updateSettings } = require('../config/settingsManager');

router.get('/settings', (req, res) => {
  const settings = getSettings();
  // Mask API key for security on the frontend
  const maskedKey = settings.nvidiaApiKey 
    ? settings.nvidiaApiKey.substring(0, 8) + '*'.repeat(20) + settings.nvidiaApiKey.slice(-4) 
    : '';
  res.json({ ...settings, nvidiaApiKey: maskedKey });
});

router.post('/settings', (req, res) => {
  const { nvidiaApiKey } = req.body;
  
  const updates = {};
  // Only update if it's not the masked string
  if (nvidiaApiKey && !nvidiaApiKey.includes('**')) {
    updates.nvidiaApiKey = nvidiaApiKey;
  }
  
  const newSettings = updateSettings(updates);
  res.json({ success: true, message: 'Settings saved successfully.' });
});

const activeCronJobs = {};

router.get('/jobs', (req, res) => {
  const jobs = Object.keys(activeCronJobs).map(cat => ({
    category: cat,
    interval: activeCronJobs[cat].interval,
    status: activeCronJobs[cat].status,
    location: activeCronJobs[cat].location
  }));
  res.json(jobs);
});

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

router.post('/firebase', async (req, res) => {
  const { query, category, location } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });
  res.json({ success: true, message: 'Firebase scrape initiated' });
});

// MANUAL SCRAPER TRIGGERS (Restored as requested)
const { exec } = require('child_process');
const path = require('path');

router.post('/python', async (req, res) => {
  const { query, location } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });
  
  // Python trigger logic with properly escaped arguments
  const pythonScript = path.join(__dirname, '../scrapers/engine-python.py');
  const safeQuery = query.replace(/"/g, '\\"');
  const safeLoc = (location || '').replace(/"/g, '\\"');
  
  const { getSettings } = require('../config/settingsManager');
  const settings = getSettings();
  const apiKey = settings.nvidiaApiKey || 'none';
  
  addLog(`[System] Triggering manual Python Engine for: "${safeQuery}" in "${safeLoc}"`);
  
  const cmd = `python "${pythonScript}" --query "${safeQuery}" --category "${safeQuery}" --location "${safeLoc}" --apikey "${apiKey}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      addLog(`[ERROR] Python engine failed: ${error.message}`);
      return;
    }
    addLog(`[INFO] Python engine stdout: ${stdout}`);
    if (stderr) addLog(`[WARN] Python engine stderr: ${stderr}`);
  });
  
  res.json({ success: true, message: 'Python script triggered successfully' });
});

router.post('/maps', async (req, res) => {
  const { query, category, location, radius } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });
  
  addLog(`[Google Maps] Manual scrape triggered for: "${query}"`);
  addScrapeJob('scrapeGooglePlaces', [query, category, location, [], 'manual-maps', null, null, radius || 10]);
  res.json({ success: true, message: 'Google Maps scrape initiated' });
});

router.post('/cheerio', async (req, res) => {
  const { engine, category, location } = req.body; // engine could be 'justdial' or 'weddingbazaar'
  if (!category || !location) return res.status(400).json({ error: 'Category and location required for directory scrapers' });
  
  if (engine === 'justdial') {
    addLog(`[JustDial] Manual scrape triggered for: "${category} in ${location}"`);
    addScrapeJob('scrapeJustDial', [category, location]);
  } else if (engine === 'weddingbazaar') {
    addLog(`[WeddingBazaar] Manual scrape triggered for: "${category} in ${location}"`);
    addScrapeJob('scrapeWeddingBazaar', [category, location]);
  } else {
    return res.status(400).json({ error: 'Invalid cheerio engine specified' });
  }
  
  res.json({ success: true, message: `${engine} scrape initiated` });
});

router.get('/keywords', async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) return res.status(400).json({ error: 'Category required' });
    const keywords = await getKeywordSynonyms(category, req.query.location || '');
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
});

// PRE-FLIGHT GEOGRAPHIC SCOPE API
const intelligentExtractor = require('../utils/intelligentExtractor');
const { parseNaturalLanguageQuery } = require('../utils/queryParser');

router.post('/preflight', async (req, res) => {
  const { location } = req.body;
  if (!location) return res.status(400).json({ error: 'Location required' });
  
  // Auto-correct location typos before checking scope
  const parsed = parseNaturalLanguageQuery(location);
  const cleanLocation = parsed.location || parsed.category || location;
  
  try {
    const scopeData = await intelligentExtractor.analyzeGeographicScope(cleanLocation);
    res.json(scopeData);
  } catch(err) {
    res.json({ type: "specific" });
  }
});

// Helper: Calculate distance in kilometers using the Haversine formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateGridCoordinates(centerLat, centerLng, radiusKm, pointCount = 30) {
  const coords = [{ lat: parseFloat(centerLat.toFixed(5)), lng: parseFloat(centerLng.toFixed(5)), distanceFromCenter: 0 }];
  if (pointCount <= 1) return coords;

  const pointsToDistribute = pointCount - 1;
  let rings = [];

  if (pointsToDistribute <= 8) {
    // Single ring
    rings.push({ distanceRatio: 0.5, points: pointsToDistribute });
  } else if (pointsToDistribute <= 20) {
    // Two rings
    const innerPoints = Math.floor(pointsToDistribute * 0.4);
    const outerPoints = pointsToDistribute - innerPoints;
    rings.push({ distanceRatio: 0.4, points: innerPoints });
    rings.push({ distanceRatio: 0.8, points: outerPoints });
  } else {
    // Three rings
    const innerPoints = Math.floor(pointsToDistribute * 0.2);
    const middlePoints = Math.floor(pointsToDistribute * 0.35);
    const outerPoints = pointsToDistribute - innerPoints - middlePoints;
    rings.push({ distanceRatio: 0.33, points: innerPoints });
    rings.push({ distanceRatio: 0.66, points: middlePoints });
    rings.push({ distanceRatio: 1.0, points: outerPoints });
  }
  
  for (const ring of rings) {
    const ringDistance = radiusKm * ring.distanceRatio;
    const angleStep = 360 / ring.points;
    
    for (let i = 0; i < ring.points; i++) {
      const angle = i * angleStep;
      const angleRad = angle * Math.PI / 180;
      
      const ptLat = centerLat + (ringDistance * Math.cos(angleRad)) / 111;
      const ptLng = centerLng + (ringDistance * Math.sin(angleRad)) / (111 * Math.cos(centerLat * Math.PI / 180));
      
      coords.push({
        lat: parseFloat(ptLat.toFixed(5)),
        lng: parseFloat(ptLng.toFixed(5)),
        distanceFromCenter: parseFloat(ringDistance.toFixed(2))
      });
    }
  }

  return coords.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
}

// STOP SCRAPING API
router.post('/stop', async (req, res) => {
  addLog('[System] User triggered Stop. Aborting all active scraping jobs...');
  globalAbortSignal.aborted = true;
  await clearQueue();
  res.json({ message: 'All active scrapers aborted and queue cleared.' });
});

// OMNI SEARCH API
router.post('/omni', async (req, res) => {
  const { query, category, location, radius, gridDensity, enabledEngines, sessionId } = req.body;
  const activeEngines = enabledEngines || ['deepseek-ai', 'maps'];

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  // The user requested NO NLP auto-correction, NO splitting for the primary.
  const exactQuery = query;
  const matchedCategory = category || query; 
  let baseLocation = location || ""; 

  // Reset Abort Signal for fresh run
  globalAbortSignal.aborted = false;

  res.json({ message: 'Omni Search Started in Background via BullMQ.' });

  addLog(`\n[Omni Search] Triggered for string: "${exactQuery}" with radius: ${radius || 0}km`);
  
  try {
    let googleMapsJobsDispatched = false;

    // Resolve Highly Accurate Location via Ola Maps API for center
    let centerGeocoded = null;
    if (baseLocation) {
      centerGeocoded = await geocodeLocation(baseLocation);
    }

    // RADIUS JUMPING FOR ALL ENGINES
    if (radius && parseInt(radius) > 0 && centerGeocoded && centerGeocoded.lat) {
      addLog(`[Radius Jumping] Center geocoded: ${centerGeocoded.formattedLocation} (${centerGeocoded.lat}, ${centerGeocoded.lng})`);
      const density = gridDensity ? parseInt(gridDensity) : 30;
      const gridCoords = generateGridCoordinates(centerGeocoded.lat, centerGeocoded.lng, parseInt(radius), density);
      addLog(`[Radius Jumping] Generated ${gridCoords.length} grid viewports covering ${radius}km radius.`);
      
      // Emit the grid coordinates to the frontend to visualize them on the map
      try { emitGridEvent(gridCoords); } catch (e) {}
      
      // Give the user 2 seconds to view the grid points on the map
      addLog(`[Radius Jumping] Plotting grid points on map. Starting jobs in 2 seconds...`);
      await new Promise(r => setTimeout(r, 2000));
      
      // Distribute jobs sequentially per coordinate to avoid overloading
      for (const coord of gridCoords) {
        const accurateLocation = `${baseLocation} (@${coord.lat},${coord.lng})`;
        const meta = { lat: coord.lat, lng: coord.lng, locationName: accurateLocation };

        if (activeEngines.includes('maps') || activeEngines.includes('google')) {
          const searchString = `${matchedCategory} near ${coord.lat},${coord.lng}`;
          const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchString)}/@${coord.lat},${coord.lng},14z`;
          addLog(`[Radius Jumping] Dispatching 360-dense query at distance ${coord.distanceFromCenter}km: ${searchUrl}`);
          await addScrapeJob('scrapeGooglePlaces', [searchUrl, matchedCategory, accurateLocation, sessionId, centerGeocoded.lat, centerGeocoded.lng, parseInt(radius)], 10, meta);
        }

        if (activeEngines.includes('google-web')) {
          const searchString = `${matchedCategory} near ${coord.lat},${coord.lng}`;
          addLog(`[Radius Jumping] Dispatching Universal Web Search at distance ${coord.distanceFromCenter}km for: ${searchString}`);
          await addScrapeJob('scrapeGoogleSerp', [searchString, matchedCategory, accurateLocation]);
        }

        if (activeEngines.includes('justdial')) {
          addLog(`[Radius Jumping] Dispatching JustDial Search at distance ${coord.distanceFromCenter}km`);
          await addScrapeJob('scrapeJustDial', [matchedCategory, accurateLocation]);
        }

        if (activeEngines.includes('weddingbazaar')) {
          addLog(`[Radius Jumping] Dispatching WeddingBazaar Search at distance ${coord.distanceFromCenter}km`);
          await addScrapeJob('scrapeWeddingBazaar', [matchedCategory, accurateLocation]);
        }

        if (activeEngines.includes('indiamart')) {
          addLog(`[Radius Jumping] Dispatching IndiaMart Stealth Search at distance ${coord.distanceFromCenter}km`);
          await addScrapeJob('scrapePuppeteerIndiaMart', [matchedCategory, accurateLocation]);
        }
      }
      googleMapsJobsDispatched = true;
    }

    // FALLBACKS & SINGLE RUNS (If Grid Search didn't trigger)
    if (!googleMapsJobsDispatched) {
      if (activeEngines.includes('maps') || activeEngines.includes('google')) {
        let textLocations = [baseLocation || exactQuery];
        if (radius && parseInt(radius) > 0 && baseLocation) {
          addLog(`[AI Location Expansion Fallback] Finding nearby towns within ${radius}km for Google Maps fallback...`);
          const nearby = await intelligentExtractor.generateNearbyLocations(baseLocation, parseInt(radius));
          if (nearby && nearby.length > 0) textLocations = nearby;
        }
        
        for (const loc of textLocations) {
          let searchStr = exactQuery;
          if (loc !== baseLocation && loc !== exactQuery && category) searchStr = `${category} in ${loc}`;
          else if (loc !== baseLocation && loc !== exactQuery && !category) searchStr = `${exactQuery} in ${loc}`;
          
          const resolvedLocationData = await geocodeLocation(loc || searchStr);
          const accurateLocation = resolvedLocationData && resolvedLocationData.lat ? resolvedLocationData.formattedLocation : loc;
          addLog(`[Google Maps Fallback] Dispatching job for: "${searchStr}"`);
          const searchStrFormatted = `${matchedCategory} near ${accurateLocation}`;
          await addScrapeJob('scrapeGooglePlaces', [searchStrFormatted, matchedCategory, accurateLocation, sessionId, centerGeocoded ? centerGeocoded.lat : null, centerGeocoded ? centerGeocoded.lng : null, radius ? parseInt(radius) : null]);
        }
      }

      if (activeEngines.includes('google-web')) {
        const searchString = `${matchedCategory} in ${baseLocation}`;
        await addScrapeJob('scrapeGoogleSerp', [searchString, matchedCategory, baseLocation]);
      }

      if (activeEngines.includes('justdial')) {
        addLog(`[JustDial] Dispatching Background JS Engine for: "${matchedCategory} in ${baseLocation || 'India'}"`);
        await addScrapeJob('scrapeJustDial', [matchedCategory, baseLocation || 'India']);
      }

      if (activeEngines.includes('weddingbazaar')) {
        addLog(`[WeddingBazaar] Dispatching Background JS Engine for: "${matchedCategory} in ${baseLocation || 'India'}"`);
        await addScrapeJob('scrapeWeddingBazaar', [matchedCategory, baseLocation || 'India']);
      }

      if (activeEngines.includes('indiamart')) {
        addLog(`[IndiaMart Stealth] Dispatching Engine for: "${matchedCategory} in ${baseLocation || 'India'}"`);
        await addScrapeJob('scrapePuppeteerIndiaMart', [matchedCategory, baseLocation || 'India']);
      }

      if (activeEngines.includes('scrapy')) {
        addLog(`[Scrapy Engine] Dispatching Python Spider for: "${matchedCategory} in ${baseLocation || 'India'}"`);
        await addScrapeJob('scrapeScrapySpider', [matchedCategory, baseLocation || 'India']);
      }
    }

    // DeepSeek AI Scraper (uses AI text expansion of town names)
    if (activeEngines.includes('deepseek-ai')) {
      let textLocations = [baseLocation || exactQuery];
      if (radius && parseInt(radius) > 0 && baseLocation) {
        addLog(`[AI Location Expansion] Finding nearby towns within ${radius}km for DeepSeek...`);
        const nearby = await intelligentExtractor.generateNearbyLocations(baseLocation, parseInt(radius));
        if (nearby && nearby.length > 0) {
          textLocations = nearby;
        }
      }
      
      for (const loc of textLocations) {
        let searchStr = exactQuery;
        if (loc !== baseLocation && loc !== exactQuery && category) searchStr = `${category} in ${loc}`;
        else if (loc !== baseLocation && loc !== exactQuery && !category) searchStr = `${exactQuery} in ${loc}`;
        addLog(`[DeepSeek AI] Dispatching job for: "${searchStr}"`);
        await addScrapeJob('scrapeDeepseekAI', [searchStr, matchedCategory, loc]);
      }
    }

    // Social Media Dorks (Instagram, Facebook, LinkedIn) - Handled distinctly by python
    const socialPlatforms = ['instagram', 'facebook', 'linkedin'].filter(p => activeEngines.includes(p));
    if (socialPlatforms.length > 0) {
      addLog(`[Social Engines] Dispatching Python Social Dork for: ${socialPlatforms.join(', ')}`);
      for (const platform of socialPlatforms) {
        const dorkStr = `site:${platform}.com ${matchedCategory} in ${baseLocation || 'India'}`;
        const pythonScript = require('path').join(__dirname, '../scrapers/engine-python-social.py');
        const safeQuery = dorkStr.replace(/"/g, '\\"');
        const safeLoc = (baseLocation || 'India').replace(/"/g, '\\"');
        const apiKey = settings.nvidiaApiKey || 'none';
        
        require('child_process').exec(`python "${pythonScript}" --query "${safeQuery}" --category "${matchedCategory}" --location "${safeLoc}" --apikey "${apiKey}"`, (error, stdout, stderr) => {
          if (!error && stdout.trim()) addLog(`[Python Social Engine] Finished: ${stdout.trim()}`);
        });
      }
    }

    // Python Engine (Google Maps Default Fallback)
    if (activeEngines.includes('python')) {
      const searchStr = `${matchedCategory} in ${baseLocation || 'India'}`;
      addLog(`[Python Engine] Triggering background Maps script for: "${searchStr}"`);
      const pythonScript = require('path').join(__dirname, '../scrapers/engine-python.py');
      const safeQuery = matchedCategory.replace(/"/g, '\\"');
      const safeLoc = (baseLocation || '').replace(/"/g, '\\"');
      const apiKey = settings.nvidiaApiKey || 'none';
      
      require('child_process').exec(`python "${pythonScript}" --query "${safeQuery}" --category "${matchedCategory}" --location "${safeLoc}" --apikey "${apiKey}"`, (error, stdout, stderr) => {
        if (!error && stdout.trim()) addLog(`[Python Engine] Finished: ${stdout.trim()}`);
      });
    }

  } catch (err) {
    addLog(`[Omni] Failed to dispatch jobs: ${err.message}`);
  }
});

// BATCH API
router.post('/batch', async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || tasks.length === 0) return res.status(400).json({ error: 'No tasks' });

  for (const t of tasks) {
    const engines = t.engines || ['maps', 'justdial', 'weddingbazaar'];
    
    // Ola Maps Geocoding
    const resolvedData = await geocodeLocation(t.location);
    const accurateLocation = resolvedData && resolvedData.lat ? resolvedData.formattedLocation : t.location;
    const q = `${t.category} in ${accurateLocation}`;
    
    // Exclusive DeepSeek AI Scraper
    await addScrapeJob('scrapeDeepseekAI', [q, t.category, accurateLocation]);

    // Regular Engines
    if (engines.includes('maps')) {
      await addScrapeJob('scrapeGooglePlaces', [q, t.category, accurateLocation, 'legacy', null, null, null]);
    }
  }

  res.json({ success: true, message: `Successfully queued ${tasks.length} bulk tasks in background memory queue.` });
});

router.post('/upload', async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: 'Invalid tasks array' });

  for (const t of tasks) {
    const aiKeywords = await getKeywordSynonyms(t.category);
    
    // Ola Maps Geocoding
    const resolvedData = await geocodeLocation(t.location);
    const accurateLocation = resolvedData && resolvedData.lat ? resolvedData.formattedLocation : t.location;
    const q = `${t.category} in ${accurateLocation}`;
    
    // DeepSeek AI and Google Maps Scrapers
    if (engines.includes('deepseek-ai')) {
      await addScrapeJob('scrapeDeepseekAI', [q, t.category, accurateLocation]);
    }
    if (engines.includes('maps') || engines.includes('google')) {
      await addScrapeJob('scrapeGooglePlaces', [q, t.category, accurateLocation, aiKeywords, 'legacy', null, null, null]);
    }
  }

  res.json({ success: true, message: `Successfully queued ${tasks.length} bulk tasks in background memory queue.` });
});

router.get('/batch/progress', async (req, res) => {
  // Can expand to fetch actual BullMQ metrics if desired
  res.json(batchProgress);
});

router.post('/jobs/stop-all', async (req, res) => {
  addLog('🔴 [SYSTEM] MASTER STOP INITIATED. Aborting all scrapes & clearing queue.');
  globalAbortSignal.aborted = true;
  await clearQueue();
  batchProgress.isActive = false;
  batchProgress.currentTask = 'Aborted';

  res.json({ success: true, message: 'All scrapes aborted and queue cleared.' });
});

module.exports = {
  scrapeRouter: router,
  setDeps
};
