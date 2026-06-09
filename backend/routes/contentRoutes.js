const express = require('express');
const router = express.Router();
const { getContent, updateFooter } = require('../controllers/contentController');

// GET /api/content - Fetch global content (used by Client & Vendor apps)
router.get('/', getContent);

// PATCH /api/content/footer - Update footer content (Admin)
router.patch('/footer', updateFooter);

module.exports = router;
