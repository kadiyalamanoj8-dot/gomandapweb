const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { createDraft, updateDraft, getApprovedVendors, getVendorById, getAllVendors, updateVendorStatus, updateLocationLock } = require('../controllers/vendorController');

// @route   POST /api/vendors/draft
// @desc    Create a draft vendor application
// @access  Public
router.post('/draft', createDraft);

// @route   PATCH /api/vendors/draft/:id
// @desc    Update a draft vendor application with images
// @access  Public
router.patch('/draft/:id', upload.array('portfolioImages', 10), updateDraft);

// @route   GET /api/vendors
// @desc    Get all approved vendors
// @access  Public
router.get('/', getApprovedVendors);

// @route   GET /api/vendors/admin/all
// @desc    Get all vendors (admin only)
// @access  Public
router.get('/admin/all', getAllVendors);

// @route   GET /api/vendors/:id
// @desc    Get single vendor by ID
// @access  Public
router.get('/:id', getVendorById);

// @route   PATCH /api/vendors/:id/status
// @desc    Update vendor status
// @access  Public
router.patch('/:id/status', updateVendorStatus);

// @route   PATCH /api/vendors/:id/location-lock
// @desc    Update vendor location lock status
// @access  Public
router.patch('/:id/location-lock', updateLocationLock);

module.exports = router;
