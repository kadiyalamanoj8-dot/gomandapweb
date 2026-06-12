const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { geocodeLocation } = require('../utils/olaMaps');

const LOCATIONS_MEMORY_FILE = path.join(__dirname, '../../db/locations_memory.json');

router.get('/memory', (req, res) => {
  if (fs.existsSync(LOCATIONS_MEMORY_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOCATIONS_MEMORY_FILE, 'utf-8'));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to parse memory file' });
    }
  } else {
    res.json({}); // Return empty if not yet created
  }
});

router.post('/geocode', async (req, res) => {
  const { locations } = req.body;
  if (!locations || !Array.isArray(locations)) {
    return res.status(400).json({ error: 'Array of locations required' });
  }

  try {
    const results = [];
    for (const loc of locations) {
      const geo = await geocodeLocation(loc);
      if (geo && geo.lat && geo.lng) {
        results.push({
          name: loc,
          lat: geo.lat,
          lng: geo.lng
        });
      }
    }
    res.json(results);
  } catch (err) {
    console.error('[Location Intel] Geocode failed:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

module.exports = router;
