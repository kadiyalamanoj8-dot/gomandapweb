const ScrapedContact = require('../models/ScrapedContact');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// 1. Import Contacts (Array of JSON)
exports.importContacts = async (req, res) => {
  try {
    const { contacts } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Invalid contacts format. Expected array.' });
    }

    // Insert ignoring duplicates (based on phone/email)
    const results = { added: 0, failed: 0 };
    for (const c of contacts) {
      try {
        // basic dedup check
        const exists = await ScrapedContact.findOne({ 
          $or: [
            { phone: c.phone, email: c.email }
          ]
        });
        if (!exists) {
          await ScrapedContact.create(c);
          results.added++;
        } else {
          results.failed++;
        }
      } catch (err) {
        results.failed++;
      }
    }

    res.json({ message: 'Import complete', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get All Scraped Contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await ScrapedContact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Update Contact Status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const contact = await ScrapedContact.findByIdAndUpdate(id, { status, lastContactedAt: new Date() }, { new: true });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Send Onboarding Email
exports.sendEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await ScrapedContact.findById(id);
    if (!contact || !contact.email) {
      return res.status(400).json({ error: 'Contact or Email not found' });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ error: 'SMTP Credentials not configured in .env' });
    }

    const transporter = getTransporter();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #D4AF37;">Partner with Gomandap!</h2>
        <p>Hi ${contact.businessName},</p>
        <p>We noticed your excellent services in the wedding industry and would love to invite you to list your business on <strong>Gomandap</strong> — the premier wedding vendor platform.</p>
        <p>Listing is completely free and puts your business in front of thousands of couples planning their weddings.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://vendor.gomandap.com" style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Register as a Vendor</a>
        </div>
        <p>Best regards,<br>The Gomandap Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Gomandap Partner Team" <${process.env.SMTP_USER}>`,
      to: contact.email,
      subject: 'Invitation to list your business on Gomandap',
      html: emailHtml,
    });

    contact.status = 'Email Sent';
    contact.lastContactedAt = new Date();
    await contact.save();

    res.json({ message: 'Email sent successfully', contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
