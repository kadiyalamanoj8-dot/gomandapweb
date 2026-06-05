const express = require('express');
const router = express.Router();
const { getSettings, toggleCategory } = require('../controllers/settingsController');

// GET /api/settings - Fetch global settings (used by Client & Vendor apps)
router.get('/', getSettings);

// PATCH /api/settings/categories/toggle - Toggle a category on/off (Admin)
router.patch('/categories/toggle', toggleCategory);

module.exports = router;
