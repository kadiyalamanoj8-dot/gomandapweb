const Inquiry = require('../models/Inquiry');
const Vendor = require('../models/Vendor');
const { sendEmail } = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

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

    // ---------------------------------------------------------
    // FREE NOTIFICATIONS LOGIC (Email & WhatsApp)
    // ---------------------------------------------------------
    
    // 1. Email to Admin
    const adminEmailHtml = `
      <h2>New Lead Received on Gomandap!</h2>
      <p><strong>Client Name:</strong> ${clientName}</p>
      <p><strong>Phone:</strong> ${clientPhone}</p>
      <p><strong>Event:</strong> ${eventType} on ${new Date(eventDate).toDateString()}</p>
      <p><strong>Vendor Requested:</strong> ${vendorExists.name} (${vendorExists.category})</p>
      <p><strong>Message:</strong> ${message}</p>
    `;
    // Replace with actual admin email from DB or env in production
    sendEmail(process.env.SMTP_EMAIL || 'admin@gomandap.com', `New Lead: ${clientName}`, adminEmailHtml);

    // 2. WhatsApp to Admin (if WhatsApp bot is linked)
    try {
      const adminPhone = process.env.ADMIN_PHONE || '919876543210'; // Set this in .env
      const waMessage = `🚨 *New Lead Alert (Gomandap)* 🚨\n\n*Name:* ${clientName}\n*Phone:* ${clientPhone}\n*Vendor:* ${vendorExists.name}\n*Event:* ${eventType}\n*Message:* ${message}`;
      await whatsappService.sendMessage(adminPhone, waMessage);
    } catch (waErr) {
      console.log('WhatsApp notification skipped. Bot might not be linked yet.');
    }

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
