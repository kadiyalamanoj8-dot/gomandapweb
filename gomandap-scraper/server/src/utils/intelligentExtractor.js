const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getNvidiaApiKey } = require('../config/settingsManager');

let indiaGeoData = null;
try {
  const dbPath = path.join(__dirname, '../../db/india_villages.json');
  if (fs.existsSync(dbPath)) {
    indiaGeoData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
} catch (e) {
  console.error('[Intelligent Extractor] Failed to load local india geo JSON:', e.message);
}

/**
 * Intelligent Agent Extractor using Nvidia's DeepSeek-V4-Pro API
 */
async function extractData(rawText, domainHint = '') {
  const defaultData = {
    servicesOffered: [],
    pricingFound: null,
    emails: [],
    phones: [],
    aiCategory: domainHint || 'Unknown',
    extractedAddress: '',
    socialLinks: {},
    businessSummary: 'Auto-extracted vendor profile from official website.',
    score: 0
  };

  if (!rawText || rawText.trim().length === 0) return defaultData;

  try {
    const phoneRegex = /(?:\+91|0)?\s?[6-9]\d{9}/g;
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
    
    const phonesMatches = [...new Set(rawText.match(phoneRegex) || [])].slice(0, 3);
    const emailsMatches = [...new Set(rawText.match(emailRegex) || [])].slice(0, 3);
    
    let score = 0;
    if (phonesMatches.length > 0) score += 40;
    if (emailsMatches.length > 0) score += 20;

    return {
      ...defaultData,
      emails: emailsMatches,
      phones: phonesMatches,
      score
    };
  } catch (error) {
    console.error(`[Heuristic Extractor] Regex failed: ${error.message}`);
    return defaultData;
  }
}

/**
 * Evaluates Search Engine Results Pages (SERP) to pick the best direct vendor links.
 */
async function evaluateSERP(serpData) {
  if (!serpData || serpData.length === 0) return [];
  // Basic heuristic filtering
  return serpData.filter(s => {
    const d = s.url.toLowerCase();
    return !d.includes('justdial') && !d.includes('wedmegood') && !d.includes('weddingwire') && !d.includes('pinterest');
  }).slice(0, 3).map(s => s.url);
}

/**
 * Generates a refined search query if the previous one failed to find enough leads.
 */
async function generateRefinedQuery(previousQuery, resultsFound) {
  return `${previousQuery} contact info official website`;
}

/**
 * Breaks down a broad location (like a District, Mandal, or City) into an array of specific sub-locations.
 */
async function generateLocalities(broadLocation) {
  if (!broadLocation) return [];
  const searchName = broadLocation.toLowerCase().trim();
  
  if (indiaGeoData) {
    let mandalMatches = [];
    let villageMatches = [];

    for (const state of indiaGeoData) {
      if (!state.districts) continue;
      for (const dist of state.districts) {
        if (!dist.subDistricts) continue;

        // MATCH DISTRICT: Return top 20 Mandals
        if (dist.district.toLowerCase() === searchName) {
          const mandals = dist.subDistricts.map(sd => sd.subDistrict).filter(Boolean);
          // Shuffle slightly or take top 20
          return mandals.slice(0, 20);
        }

        for (const sub of dist.subDistricts) {
          // MATCH MANDAL: Return top 20 Villages
          if (sub.subDistrict.toLowerCase() === searchName) {
            if (sub.villages && sub.villages.length > 0) {
              return sub.villages.filter(Boolean).slice(0, 20);
            } else {
              return [broadLocation];
            }
          }
          
          // MATCH EXACT VILLAGE
          if (sub.villages) {
            for (const v of sub.villages) {
               if (v.toLowerCase() === searchName) return [broadLocation];
            }
          }
        }
      }
    }
  }

  // Fallback if not found in database or dataset missing
  console.log(`[Intelligent Extractor] Local JSON miss for "${broadLocation}". Returning raw query.`);
  return [broadLocation];
}

/**
 * Generates nearby towns/localities within a given radius.
 */
async function generateNearbyLocations(location, radiusKm) {
  const prompt = `You are a geographic AI assistant. The user wants to search for vendors within ${radiusKm}km of "${location}".
Return a JSON array of 5 to 10 major towns, cities, or prominent neighborhoods that fall within this radius. Include the original location as the first element.
Return ONLY a valid JSON array of strings. Do not include markdown formatting or any other text.
Example format: ["Guntur City", "Tenali", "Mangalagiri", "Bapatla"]`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 45000 }
    );

    const rawContent = response.data.choices[0].message.content;
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return Array.isArray(parsed) ? parsed : [location];
  } catch (err) {
    console.error(`[Intelligent Extractor] generateNearbyLocations failed: ${err.message}`);
    return [location]; // Fallback to original
  }
}

/**
 * Analyzes a location to determine its geographic scope and returns culturally accurate subdivisions.
 */
async function analyzeGeographicScope(location) {
  const prompt = `You are a geographic intelligence AI. The user wants to search for vendors in "${location}".
Determine if this location is a broad region (like a District, State, County, or Province) or a specific localized town/city.
If it is a specific localized town/city, return: {"type": "specific"}
If it is a broad region, you must provide exactly 3 culturally accurate search scope options for the user. 
For example:
- If "Guntur", return: {"type": "broad", "options": ["Search Entire District", "Search Only Guntur City", "Search All Mandals"]}
- If "New York", return: {"type": "broad", "options": ["Search Entire State", "Search Only NYC", "Search All Counties"]}
- If "London", return: {"type": "broad", "options": ["Search Greater London", "Search City of London", "Search All Boroughs"]}
Return ONLY valid JSON format. Do not use markdown wrappers.`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 45000 }
    );

    const rawContent = response.data.choices[0].message.content;
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error(`[Intelligent Extractor] analyzeGeographicScope failed: ${err.message}`);
    return { type: "specific" }; // Safe fallback
  }
}

/**
 * Fetches localities (villages, towns, nodes) for a given region using OSM Nominatim.
 * Provides precise lat/lng coordinates for geographical gridding.
 */
async function fetchOSMLocalities(region) {
  if (!region) return [];
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: region, format: 'json', addressdetails: 1, limit: 20, countrycodes: 'in' },
      headers: { 'User-Agent': 'GomandapScraper/1.0 (contact@gomandap.com)' },
      timeout: 10000
    });
    
    return response.data.map(item => ({
      name: item.name,
      lat: item.lat,
      lng: item.lon, // scrape.js expects lng
      type: item.type
    })).filter(loc => loc.lat && loc.lng);
  } catch (err) {
    console.error('[OSM Engine] fetchOSMLocalities failed:', err.message);
    return [];
  }
}

/**
 * Returns a flattened array of all districts and mandals from the geo database.
 * Formatted for Orama knowledge engine initialization.
 */
function getAllLocalities() {
  const locs = [];
  if (!indiaGeoData) return locs;

  for (const state of indiaGeoData) {
    // Only fetch Andhra Pradesh and Telangana for performance, or fetch all if needed
    // Let's fetch all Districts and SubDistricts (Mandals)
    if (!state.districts) continue;
    for (const dist of state.districts) {
      if (dist.district) {
        locs.push({ type: 'district', name: dist.district });
      }
      if (!dist.subDistricts) continue;
      for (const sub of dist.subDistricts) {
        if (sub.subDistrict) {
          locs.push({ type: 'mandal', name: sub.subDistrict, district: dist.district });
        }
      }
    }
  }
  
  // Deduplicate
  const uniqueLocs = [];
  const seen = new Set();
  for (const loc of locs) {
    if (!seen.has(loc.name.toLowerCase())) {
      seen.add(loc.name.toLowerCase());
      uniqueLocs.push(loc);
    }
  }
  
  return uniqueLocs;
}

module.exports = {
  extractData,
  evaluateSERP,
  generateRefinedQuery,
  generateLocalities,
  generateNearbyLocations,
  analyzeGeographicScope,
  fetchOSMLocalities,
  getAllLocalities
};
