const mongoose = require('mongoose');

const ScrapedContactSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  category: { type: String, required: false },
  phone: { type: String, required: false },
  email: { type: String, required: false },
  source: { type: String, default: 'Scraper' },
  city: { type: String, required: false },
  status: { 
    type: String, 
    enum: ['Pending', 'WhatsApp Sent', 'Email Sent', 'Onboarded', 'Rejected'], 
    default: 'Pending' 
  },
  notes: { type: String },
  lastContactedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScrapedContact', ScrapedContactSchema);
