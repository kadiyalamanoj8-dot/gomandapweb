const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const nodemailer = require('nodemailer');

// Helper to send email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_EMAIL || 'contact@gomandap.com',
    pass: process.env.GOOGLE_EMAIL_APP_PASSWORD || 'your-app-password'
  }
});



// Get all leads
router.get('/', async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get a single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update lead status
router.put('/:id', async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Send Magic Link via Email
router.post('/:id/send-email', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (!req.body.targetEmail) return res.status(400).json({ success: false, message: 'Target email required' });

    // In a real app, you'd use the deployed frontend URL. 
    const magicLink = `http://localhost:5173/vendor/onboarding?lead_id=${lead._id}`;
    
    const mailOptions = {
      from: `"Gomandap Partner Team" <${process.env.GOOGLE_EMAIL || 'contact@gomandap.com'}>`,
      to: req.body.targetEmail,
      subject: `Partnership Inquiry: Claim your profile on Gomandap - ${lead.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #D4AF37;">Gomandap Partner Invitation</h2>
          <p>Hi team at <strong>${lead.name}</strong>,</p>
          <p>We saw your excellent profile on Google Maps and would love to feature your ${lead.category} venue on <strong>Gomandap.com</strong>.</p>
          <p>We have already set up a premium draft profile for you. Please click the secure link below to claim it, verify your details, and start receiving bookings from verified clients.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #D4AF37; color: black; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Claim Your Profile Now
            </a>
          </div>
          <p>If you have any questions, reply directly to this email.</p>
          <p>Best regards,<br>The Gomandap Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    lead.emailStatus = 'Sent';
    lead.status = 'Outreach Sent';
    await lead.save();

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email. Check SMTP credentials.' });
  }
});

module.exports = router;
