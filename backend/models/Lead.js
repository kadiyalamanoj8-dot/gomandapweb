const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: false },
  email: { type: String, required: false },
  address: {
    street: String,
    city: String,
    pincode: String,
    state: { type: String, default: 'Andhra Pradesh' }
  },
  category: { type: String, required: true },
  source: { type: String, default: 'Google Maps Scraper' },
  mapsLink: { type: String, required: false },
  rating: { type: Number, required: false },
  
  // CRM Tracking
  status: {
    type: String,
    enum: ['New', 'Outreach Sent', 'Claimed', 'Live', 'Discarded'],
    default: 'New'
  },
  whatsappStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Replied'],
    default: 'Not Sent'
  },
  emailStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Opened', 'Clicked'],
    default: 'Not Sent'
  },
  
  // Reference to the created vendor if they claim it
  claimedVendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
