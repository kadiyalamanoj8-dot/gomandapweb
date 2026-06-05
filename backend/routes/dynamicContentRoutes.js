const express = require('express');
const router = express.Router();
const { getDynamicContent, updateDynamicContent } = require('../controllers/dynamicContentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDynamicContent) // Public access for Client and Vendor apps to fetch SEO/Footers
  .put(protect, admin, updateDynamicContent); // Admin only

module.exports = router;
