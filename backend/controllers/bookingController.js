const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');

// @desc    Create a booking (Instant or B2B Quote)
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const { vendorId, userId, bookingDate, userRoleAtBooking, totalAmount, isQuoteRequest, vendorQuoteNotes } = req.body;
    
    // In a real app, verify user and role
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const newBooking = new Booking({
      vendorId,
      userId,
      bookingDate,
      userRoleAtBooking,
      totalAmount,
      isQuoteRequest,
      vendorQuoteNotes,
      status: isQuoteRequest ? 'pending' : 'confirmed', // D2C might be instant
      vendorPriceApplied: userRoleAtBooking === 'b2b' ? vendor.pricing?.b2bPrice : vendor.pricing?.standardPrice
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get bookings for a specific vendor
// @route   GET /api/bookings/vendor/:vendorId
// @access  Public
const getVendorBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ vendorId: req.params.vendorId }).populate('userId', 'name email');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get bookings for a specific client
// @route   GET /api/bookings/user/:userId
// @access  Public
const getClientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate('vendorId', 'name category locationData');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin intervene/update a booking
// @route   PATCH /api/bookings/:id/admin
// @access  Public (Should be protected)
const adminUpdateBooking = async (req, res) => {
  try {
    const { status, adminOverridePriceApplied, adminQuoteNotes, adminInterventionReason, processPayment } = req.body;
    
    let updateFields = {};
    if (status) updateFields.status = status;
    if (adminOverridePriceApplied !== undefined) {
      updateFields.adminOverridePriceApplied = adminOverridePriceApplied;
      updateFields.totalAmount = adminOverridePriceApplied;
    }
    if (adminQuoteNotes) updateFields.adminQuoteNotes = adminQuoteNotes;
    if (adminInterventionReason) updateFields.adminInterventionReason = adminInterventionReason;

    // Financial Routing Logic
    if (processPayment) {
      updateFields.paymentStatus = 'paid';
      
      const bookingToCalc = await Booking.findById(req.params.id).populate('vendorId');
      if (bookingToCalc && bookingToCalc.vendorId) {
        const vendor = bookingToCalc.vendorId;
        const finalTotal = updateFields.totalAmount || bookingToCalc.totalAmount;
        
        let platformFee = 0;
        let vendorPayoutAmount = finalTotal;

        if (vendor.bookingSettings?.monetizationModel === 'commission') {
          const rate = vendor.bookingSettings?.commissionRate || 10;
          platformFee = (finalTotal * rate) / 100;
          vendorPayoutAmount = finalTotal - platformFee;
        } else if (vendor.bookingSettings?.monetizationModel === 'subscription') {
          platformFee = 0; // Flat fee charged elsewhere
          vendorPayoutAmount = finalTotal;
        }

        updateFields.platformFee = platformFee;
        updateFields.vendorPayoutAmount = vendorPayoutAmount;
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin
// @access  Public (Should be protected)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vendorId', 'name category bookingSettings pricing')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createBooking,
  getVendorBookings,
  getClientBookings,
  adminUpdateBooking,
  getAllBookings
};
