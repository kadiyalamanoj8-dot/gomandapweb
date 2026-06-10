const express = require('express');
const router = express.Router();
const {
  createBooking,
  getVendorBookings,
  getClientBookings,
  adminUpdateBooking,
  getAllBookings
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/admin', getAllBookings);
router.get('/vendor/:vendorId', getVendorBookings);
router.get('/user/:userId', getClientBookings);
router.patch('/:id/admin', adminUpdateBooking);

module.exports = router;
