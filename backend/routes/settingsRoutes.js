const express = require('express');
const router = express.Router();
const { getSettings, toggleCategory, toggleLanguage } = require('../controllers/settingsController');

// GET /api/settings - Fetch global settings (used by Client & Vendor apps)
router.get('/', getSettings);

// PATCH /api/settings/categories/toggle - Toggle a category on/off (Admin)
router.patch('/categories/toggle', toggleCategory);

// PATCH /api/settings/languages/toggle - Toggle a language on/off (Admin)
router.patch('/languages/toggle', toggleLanguage);

module.exports = router;
