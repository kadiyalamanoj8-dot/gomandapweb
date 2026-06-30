const express = require('express');
const axios = require('axios');
const router = express.Router();
const { scrapeOsmVendors } = require('../scrapers/engine-osm');
const { scrapeBingLocal } = require('../scrapers/engine-bing');
const { scrapeYahooLocal } = require('../scrapers/engine-yahoo');
const { scrapeWebsite, getProxyList } = require('../utils/deepScraper');

// Sub-locality fetcher helper
async function getLocalities(city) {
    try {
        const overpassQuery = `[out:json][timeout:15];node["place"="city"]["name"="${city}"]->.center;(node["place"="suburb"](around.center:10000);node["place"="neighbourhood"](around.center:10000););out body;`;
        
        const res = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, { timeout: 15000 });
        let locs = [];
        if (res.data && res.data.elements) {
            res.data.elements.forEach(el => {
                if (el.tags && el.tags.name) locs.push(el.tags.name);
            });
        }
        return [...new Set(locs)].slice(0, 10); // Limit to top 10 localities
    } catch (e) {
        console.error('Locality fetch failed:', e.message);
        return []; // Fallback to main city
    }
}

router.post('/autocomplete', async (req, res) => {
    const { type, query } = req.body;
    if (!query || query.trim().length < 2) return res.json({ suggestions: [] });
    
    if (type === 'category') {
        try {
            // Unrestricted Google Category Suggestion
            const response = await axios.get(`http://suggestqueries.google.com/complete/search`, {
                params: { client: 'chrome', q: query },
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (response.data && response.data[1]) {
                let suggestions = response.data[1].filter(s => !s.toLowerCase().includes('near me')).slice(0, 5);
                suggestions = suggestions.map(s => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                return res.json({ suggestions });
            }
        } catch(e) {
            return res.json({ suggestions: [] });
        }
    }
  
    if (type === 'location') {
        try {
            // Global Location Autocomplete via OSM Nominatim
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: query, format: 'json', limit: 5, 'accept-language': 'en' },
                headers: { 'User-Agent': 'GomandapScraper/1.0' }
            });
            const suggestions = response.data.map(item => {
                const parts = item.display_name.split(',').map(p => p.trim());
                return parts.slice(0, 2).join(', ');
            });
            return res.json({ suggestions: [...new Set(suggestions)] });
        } catch(e) {
            return res.json({ suggestions: [] });
        }
    }
    
    res.json({ suggestions: [] });
});

router.post('/ultra-scrape', async (req, res) => {
    const { city, category } = req.body;
  
    if (!city || !category) {
        return res.status(400).json({ error: 'City and category are required' });
    }
  
    // SSE Headers for chunked streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    const sendChunk = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
  
    try {
        const localities = await getLocalities(city);
        sendChunk({ status: 'started', totalLocations: localities.length > 0 ? localities.length : 1 }); 
    
        let isAborted = false;
        req.on('close', () => {
            console.log('[Ultra-Scrape] Client disconnected. Aborting sweep.');
            isAborted = true;
        });
    
        const sendLog = (msg) => {
            sendChunk({ status: 'log', message: msg });
        };
    
        const runOsm = async () => {
            if (isAborted) return [];
            sendChunk({ status: 'scraping_locality', locality: 'OpenStreetMap API (0ms Block-Free)' });
            const vendors = await scrapeOsmVendors(city, category, sendLog);
            if (isAborted) return [];
            sendChunk({ status: 'found', count: vendors.length, locality: 'OSM Overpass' });
            return vendors;
        };
    
        const runEngine = async (engineFn, engineName, localities) => {
            if (isAborted) return [];
            let allResults = [];
            const searchTerms = localities.length > 0 ? localities.map(l => `${category} in ${l} ${city}`) : [`${category} in ${city}`];
            const proxies = await getProxyList();
            
            for (const query of searchTerms) {
                if (isAborted) break;
                let proxyUrl = proxies.length > 0 ? `http://${proxies[Math.floor(Math.random() * proxies.length)]}` : null;
                
                sendChunk({ status: 'scraping_locality', locality: `${engineName}: ${query} (Proxy Routing...)` });
                
                for (let h = 0; h < 4; h++) {
                    await new Promise(r => setTimeout(r, 3000));
                    sendChunk({ status: 'heartbeat', message: 'Keeping connection alive...' });
                }
                
                let vendors = await engineFn(query, sendLog, proxyUrl);
                
                // Deep Search
                await Promise.all(vendors.map(async (v) => {
                    if (v.website) {
                        const webData = await scrapeWebsite(v.website);
                        if (webData.email) v.email = webData.email;
                        if (webData.socials) v.socials = webData.socials;
                    }
                }));
                
                allResults.push(...vendors);
                sendChunk({ status: 'found', count: vendors.length, locality: `${engineName}: ${query}` });
                sendChunk({ status: 'partial_results', data: vendors });
            }
            return allResults;
        };
    
        // Parallel run
        const results = await Promise.all([
            runOsm(), 
            runEngine(scrapeBingLocal, 'Bing Local', localities), 
            runEngine(scrapeYahooLocal, 'Yahoo Local', localities)
        ]);
        
        const allVendors = results.flat();
    
        // Deduplicate
        const uniqueMap = new Map();
        allVendors.forEach(v => {
            if (!v.name) return;
            const key = v.name.toLowerCase().trim();
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, v);
            } else {
                const existing = uniqueMap.get(key);
                if (!existing.phone && v.phone) existing.phone = v.phone;
                if (!existing.website && v.website) existing.website = v.website;
                if (!existing.email && v.email) existing.email = v.email;
            }
        });
        
        const finalVendors = Array.from(uniqueMap.values());
    
        sendChunk({ 
            status: 'completed', 
            totalFound: finalVendors.length,
            data: finalVendors
        });
  
    } catch (error) {
        console.error(`[Ultra-Scrape] Fatal error: ${error.message}`);
        sendChunk({ status: 'error', message: error.message });
    } finally {
        res.end();
    }
});

module.exports = router;
