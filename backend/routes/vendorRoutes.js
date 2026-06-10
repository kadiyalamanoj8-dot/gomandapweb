const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { createDraft, syncVendorAuth, syncGoogleAuth, updateDraft, getApprovedVendors, getVendorById, getAllVendors, updateVendorStatus, updateLocationLock, updateVendorSettings, updateAdminVendorSettings } = require('../controllers/vendorController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/vendors/draft
// @desc    Create a draft vendor application
// @access  Public
router.post('/draft', createDraft);

// @route   POST /api/vendors/auth/sync
// @desc    Sync Vendor Auth
// @access  Public
router.post('/auth/sync', syncVendorAuth);

// @route   POST /api/vendors/auth/google
// @desc    Sync Google Auth
// @access  Public
router.post('/auth/google', syncGoogleAuth);

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
// @access  Private/Admin
router.get('/admin/all', protect, admin, getAllVendors);

// @route   GET /api/vendors/:id
// @desc    Get single vendor by ID
// @access  Public
router.get('/:id', getVendorById);

// @route   PATCH /api/vendors/:id/status
// @desc    Update vendor status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, updateVendorStatus);

// @route   PATCH /api/vendors/:id/location-lock
// @desc    Update vendor location lock status
// @access  Private/Admin
router.patch('/:id/location-lock', protect, admin, updateLocationLock);

// @route   PATCH /api/vendors/:id/settings
// @desc    Update vendor settings (availability, pricing)
// @access  Private (Needs vendor auth, using protect for now)
router.patch('/:id/settings', protect, updateVendorSettings);

// @route   PATCH /api/vendors/:id/admin-settings
// @desc    Update admin controls for vendor
// @access  Private/Admin
router.patch('/:id/admin-settings', protect, admin, updateAdminVendorSettings);

module.exports = router;
