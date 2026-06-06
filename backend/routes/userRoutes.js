const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');

// @route   GET /api/users/admin/all
// @desc    Get all registered clients
// @access  Public (Should be protected with admin middleware in prod)
router.get('/admin/all', getAllUsers);

module.exports = router;
