const express = require('express');
const router = express.Router();
const {
  createBooking,
  getVendorBookings,
  getClientBookings,
  adminUpdateBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public - clients can create bookings
router.post('/', createBooking);

// Admin only - requires valid admin JWT
router.get('/admin', protect, admin, getAllBookings);
router.patch('/:id/admin', protect, admin, adminUpdateBooking);

// Vendor/User specific (uses protect for token validation)
router.get('/vendor/:vendorId', protect, getVendorBookings);
router.get('/user/:userId', protect, getClientBookings);

module.exports = router;
