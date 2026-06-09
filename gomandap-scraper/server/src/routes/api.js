const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const MiniSearch = require('minisearch');
const { axiosWithProxy, getRandomIP } = require('../scrapers/proxyManager');

const REGIONS_FILE = path.join(__dirname, '../../../data', 'regions.json');
const getRegions = () => fs.existsSync(REGIONS_FILE) ? JSON.parse(fs.readFileSync(REGIONS_FILE, 'utf-8')) : {};

const CATEGORIES = [
  "Banquet Halls", "Kalyana Mandapams", "Open Lawns & Farmhouses", 
  "Resorts & Destination Venues", "5-Star Hotels", "Party & Mini Halls", 
  "Temples & Ashrams", "Wedding Photographers", "Candid Photographers", 
  "Pre-Wedding Shoots", "Cinematographers", "Drone Specialists", 
  "Instant Photo Booths", "Decorators", "Caterers", "Makeup Artists", 
  "Mehndi Designers", "Wedding Clothes / Boutiques", "Jewelry Shops", 
  "Wedding Cards & Invites", "Cars & Buses (Travel)", "Astrologers / Pundits", 
  "Honeymoon Packages", "Event Planners"
];

const getFlatLocations = () => {
  const regions = getRegions();
  let allLocs = [];
  for (const [district, mandals] of Object.entries(regions)) {
    allLocs.push({ type: 'district', name: district });
    if (mandals) {
      for (const m of mandals) {
        allLocs.push({ type: 'mandal', name: m, district: district });
      }
    }
  }
  return allLocs;
};

let locationSearch = new MiniSearch({
  fields: ['name', 'district'], 
  storeFields: ['name', 'type', 'district'],
  searchOptions: { fuzzy: 0.2, prefix: true }
});

const indexLocations = () => {
  locationSearch.removeAll();
  const flat = getFlatLocations().map((loc, i) => ({ id: `loc_${i}`, ...loc }));
  locationSearch.addAll(flat);
};
indexLocations();

router.get('/regions', (req, res) => {
  res.json(getRegions());
});

router.get('/knowledge', (req, res) => {
  res.json({
    categories: CATEGORIES,
    locations: getFlatLocations()
  });
});

router.get('/location/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const fakeIP = getRandomIP();
    const response = await axiosWithProxy(`https://nominatim.openstreetmap.org/search`, {
      params: { q: query, format: 'json', addressdetails: 1, limit: 5, countrycodes: 'in' },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'X-Forwarded-For': fakeIP,
        'X-Real-IP': fakeIP
      },
      timeout: 5000 
    });

    const parsedLocations = response.data.map(item => ({
      name: item.name,
      display: item.display_name,
      type: item.type,
      lat: item.lat,
      lon: item.lon
    })).filter(loc => loc.name);

    res.json(parsedLocations);
  } catch (error) {
    console.error('Nominatim Proxy Error:', error.message);
    res.json([]);
  }
});

// Logs are passed from app state into this router
let getLogs = () => [];
router.get('/logs', (req, res) => res.json(getLogs()));

module.exports = {
  apiRouter: router,
  CATEGORIES,
  getFlatLocations,
  setLogGetter: (fn) => getLogs = fn
};
