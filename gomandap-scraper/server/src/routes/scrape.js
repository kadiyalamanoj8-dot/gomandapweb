const express = require('express');
const router = express.Router();
// Engines
const { scrapeGooglePlaces, setDeps: setPlacesDeps } = require('../scrapers/engine-google-places');
const { scrapeDuckDuckGoDork, setLogger: setDorkLogger } = require('../scrapers/engine-social-dork');
const { scrapeJustDial, setDeps: setJDDeps } = require('../scrapers/engine-justdial');
const { scrapeWeddingBazaar, setDeps: setWBDeps } = require('../scrapers/engine-weddingbazaar');
const { scrapeWeddingWire, setDeps: setWWDeps } = require('../scrapers/engine-weddingwire');
const { scrapeMandap, setDeps: setMandapDeps } = require('../scrapers/engine-mandap');
const { scrapeBraveDork, setDeps: setBraveDeps } = require('../scrapers/engine-brave-dork');
const { scrapeDeepseekAI, setDeps: setDeepseekDeps } = require('../scrapers/engine-deepseek');

const { getKeywordSynonyms } = require('../utils/aiParser');
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

// Register tasks with BullMQ
registerTask('scrapeGooglePlaces', async (q, cat, loc, aiKeywords, sessionId, centerLat, centerLng, radiusKm) => safeExecute(() => scrapeGooglePlaces(q, cat, loc, aiKeywords, sessionId, centerLat, centerLng, radiusKm), 'Google Places Scrape', addLog));
registerTask('scrapeJustDial', async (cat, loc) => safeExecute(() => scrapeJustDial(cat, loc), 'JustDial Scrape', addLog));
registerTask('scrapeWeddingBazaar', async (cat, loc) => safeExecute(() => scrapeWeddingBazaar(cat, loc), 'WeddingBazaar Scrape', addLog));
registerTask('scrapeWeddingWire', async (cat, loc) => safeExecute(() => scrapeWeddingWire(cat, loc), 'WeddingWire Scrape', addLog));
registerTask('scrapeMandap', async (cat, loc) => safeExecute(() => scrapeMandap(cat, loc), 'Mandap Scrape', addLog));
registerTask('scrapeDuckDuckGoDork', async (domain, q, cat, loc) => safeExecute(() => scrapeDuckDuckGoDork(domain, q, cat, loc, globalAbortSignal), `DDG Dork ${domain}`, addLog));
registerTask('scrapeBraveDork', async (domain, q, cat, loc) => safeExecute(() => scrapeBraveDork(domain, q, cat, loc), `Brave Dork ${domain}`, addLog));
registerTask('scrapeDeepseekAI', async (q, cat, loc) => safeExecute(() => scrapeDeepseekAI(q, cat, loc), 'DeepSeek AI Scrape', addLog));

function setDeps(deps) {
  addLog = deps.logger;
  globalAbortSignal = deps.abortSignal;
  if (setPlacesDeps) setPlacesDeps(deps);
  if (setDorkLogger) setDorkLogger(deps.logger);
  if (setJDDeps) setJDDeps(deps);
  if (setWBDeps) setWBDeps(deps);
  if (setWWDeps) setWWDeps(deps);
  if (setMandapDeps) setMandapDeps(deps);
  if (setBraveDeps) setBraveDeps(deps);
  if (setDeepseekDeps) setDeepseekDeps(deps);
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

router.get('/keywords', async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) return res.status(400).json({ error: 'Category required' });
    const keywords = await getKeywordSynonyms(category);
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

function generateGridCoordinates(centerLat, centerLng, radiusKm) {
  // Dense 360-degree radial grid generation
  const coords = [{ lat: parseFloat(centerLat.toFixed(5)), lng: parseFloat(centerLng.toFixed(5)), distanceFromCenter: 0 }];
  
  // Create rings to cover the area densely in 360 degrees (total 25 points including center)
  const rings = [
    { distance: radiusKm * 0.3, points: 6 },
    { distance: radiusKm * 0.6, points: 8 },
    { distance: radiusKm * 0.9, points: 10 }
  ];

  rings.forEach(ring => {
    for (let i = 0; i < ring.points; i++) {
      const angle = (i * 360) / ring.points;
      const angleRad = angle * Math.PI / 180;
      
      // 1 degree lat = ~111km
      const ptLat = centerLat + (ring.distance * Math.cos(angleRad)) / 111;
      const ptLng = centerLng + (ring.distance * Math.sin(angleRad)) / (111 * Math.cos(centerLat * Math.PI / 180));
      
      coords.push({
        lat: parseFloat(ptLat.toFixed(5)),
        lng: parseFloat(ptLng.toFixed(5)),
        distanceFromCenter: parseFloat(ring.distance.toFixed(2))
      });
    }
  });

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
  const { query, category, location, radius, enabledEngines, sessionId } = req.body;
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

    // RADIUS JUMPING FOR GOOGLE MAPS
    if (radius && parseInt(radius) > 0 && centerGeocoded && centerGeocoded.lat) {
      addLog(`[Radius Jumping] Center geocoded: ${centerGeocoded.formattedLocation} (${centerGeocoded.lat}, ${centerGeocoded.lng})`);
      const gridCoords = generateGridCoordinates(centerGeocoded.lat, centerGeocoded.lng, parseInt(radius));
      addLog(`[Radius Jumping] Generated ${gridCoords.length} grid viewports covering ${radius}km radius.`);
      
      if (activeEngines.includes('maps') || activeEngines.includes('google')) {
        const aiKeywords = await getKeywordSynonyms(matchedCategory);
        for (const coord of gridCoords) {
          // Construct strict coordinate-based search explicitly enforcing location
          const searchString = `${matchedCategory} near ${coord.lat},${coord.lng}`;
          const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchString)}/@${coord.lat},${coord.lng},14z`;
          
          addLog(`[Radius Jumping] Dispatching 360-dense query at distance ${coord.distanceFromCenter}km: ${searchUrl}`);
          await addScrapeJob('scrapeGooglePlaces', [searchUrl, matchedCategory, `${baseLocation} (@${coord.lat},${coord.lng})`, aiKeywords, sessionId, centerGeocoded.lat, centerGeocoded.lng, parseInt(radius)]);
        }
        googleMapsJobsDispatched = true;
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
        if (loc !== baseLocation && loc !== exactQuery && category) {
          searchStr = `${category} in ${loc}`;
        } else if (loc !== baseLocation && loc !== exactQuery && !category) {
          searchStr = `${exactQuery} in ${loc}`;
        }
        addLog(`[DeepSeek AI] Dispatching job for: "${searchStr}"`);
        await addScrapeJob('scrapeDeepseekAI', [searchStr, matchedCategory, loc]);
      }
    }

    // Fallback if Google Maps engine selected but geocoding or radius jumping failed/skipped
    if ((activeEngines.includes('maps') || activeEngines.includes('google')) && !googleMapsJobsDispatched) {
      let textLocations = [baseLocation || exactQuery];
      if (radius && parseInt(radius) > 0 && baseLocation) {
        addLog(`[AI Location Expansion Fallback] Finding nearby towns within ${radius}km for Google Maps fallback...`);
        const nearby = await intelligentExtractor.generateNearbyLocations(baseLocation, parseInt(radius));
        if (nearby && nearby.length > 0) {
          textLocations = nearby;
        }
      }
      
      const aiKeywords = await getKeywordSynonyms(matchedCategory);
      for (const loc of textLocations) {
        let searchStr = exactQuery;
        if (loc !== baseLocation && loc !== exactQuery && category) {
          searchStr = `${category} in ${loc}`;
        } else if (loc !== baseLocation && loc !== exactQuery && !category) {
          searchStr = `${exactQuery} in ${loc}`;
        }
        
        const resolvedLocationData = await geocodeLocation(loc || searchStr);
        const accurateLocation = resolvedLocationData && resolvedLocationData.lat ? resolvedLocationData.formattedLocation : loc;
        addLog(`[Google Maps Fallback] Dispatching job for: "${searchStr}"`);
        const searchStrFormatted = `${matchedCategory} near ${accurateLocation}`;
        await addScrapeJob('scrapeGooglePlaces', [searchStrFormatted, matchedCategory, accurateLocation, aiKeywords, sessionId, centerGeocoded ? centerGeocoded.lat : null, centerGeocoded ? centerGeocoded.lng : null, radius ? parseInt(radius) : null]);
      }
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
    const aiKeywords = await getKeywordSynonyms(t.category);
    
    // Ola Maps Geocoding
    const resolvedData = await geocodeLocation(t.location);
    const accurateLocation = resolvedData && resolvedData.lat ? resolvedData.formattedLocation : t.location;
    const q = `${t.category} in ${accurateLocation}`;
    
    // Exclusive DeepSeek AI Scraper
    await addScrapeJob('scrapeDeepseekAI', [q, t.category, accurateLocation]);
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
