const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// @route   GET /api/whatsapp/status
// @desc    Get WhatsApp connection status and QR code
// @access  Public (Should be protected by admin middleware in production)
router.get('/status', (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/whatsapp/send-bulk
// @desc    Send bulk marketing messages to scraped vendors
// @access  Public (Should be protected by admin middleware in production)
router.post('/send-bulk', async (req, res) => {
  const { vendors, template } = req.body;

  if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
    return res.status(400).json({ success: false, error: 'Please provide an array of vendors with phone numbers.' });
  }

  if (!template) {
    return res.status(400).json({ success: false, error: 'Please provide a message template.' });
  }

  const status = whatsappService.getStatus();
  if (!status.isReady) {
    return res.status(400).json({ success: false, error: 'WhatsApp client is not connected. Please scan the QR code first.' });
  }

  // Acknowledge the request immediately and process in background to prevent timeout
  res.json({ success: true, message: `Started sending messages to ${vendors.length} vendors in the background. Check server logs.` });

  // Background Processing Loop with 15-second delay to prevent banning
  (async () => {
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      // Skip if no contact array or no first contact
      if (!vendor.contact || vendor.contact.length === 0) {
        console.log(`Skipping ${vendor.name} - No contact info`);
        failCount++;
        continue;
      }

      const phone = vendor.contact[0];
      
      // Basic template replacement
      const message = template
        .replace('{{name}}', vendor.name || 'Vendor')
        .replace('{{category}}', vendor.category || 'Event Professional');

      try {
        console.log(`Sending WhatsApp to ${vendor.name} (${phone})...`);
        await whatsappService.sendMessage(phone, message);
        successCount++;
        console.log(`✅ Success for ${vendor.name}`);
      } catch (error) {
        console.error(`❌ Failed for ${vendor.name}:`, error.message);
        failCount++;
      }

      // Add a 15-second delay between messages to prevent spam detection!
      if (i < vendors.length - 1) {
        console.log('Waiting 15 seconds before next message to prevent ban...');
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    }

    console.log(`Bulk WhatsApp process completed. Success: ${successCount}, Failed: ${failCount}`);
  })();
});

module.exports = router;
