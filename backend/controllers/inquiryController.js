const Inquiry = require('../models/Inquiry');
const Vendor = require('../models/Vendor');

// @desc    Create a new inquiry (Public/Client)
// @route   POST /api/inquiries
// @access  Public
const createInquiry = async (req, res) => {
  try {
    const { vendorId, clientId, clientName, clientPhone, eventDate, eventType, guestCount, message } = req.body;

    if (!vendorId || !clientName || !clientPhone || !eventDate || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    const inquiry = await Inquiry.create({
      vendorId,
      clientId: clientId || undefined,
      clientName,
      clientPhone,
      eventDate,
      eventType,
      guestCount,
      message
    });

    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all inquiries for a specific vendor
// @route   GET /api/inquiries/vendor/:vendorId
// @access  Public (Should be protected by Vendor Auth in prod)
const getVendorInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update inquiry status
// @route   PATCH /api/inquiries/:id/status
// @access  Public (Should be protected by Vendor Auth in prod)
const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createInquiry,
  getVendorInquiries,
  updateInquiryStatus
};
