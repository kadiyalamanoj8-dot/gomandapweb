const express = require('express');
const router = express.Router();
const { getAdPackage, updateAdPackage } = require('../controllers/adController');

router.get('/package', getAdPackage);
router.patch('/package', updateAdPackage);

module.exports = router;
