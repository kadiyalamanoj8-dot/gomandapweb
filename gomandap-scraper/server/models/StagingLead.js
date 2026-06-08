const mongoose = require('mongoose');

const stagingLeadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Legacy ID or place_id
  name: { type: String, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  phone: { type: String, default: 'Requires Manual Lookup' },
  rating: { type: Number, default: null },
  mapsLink: { type: String, default: '' },
  source: { type: String, default: 'Unknown' },
  verified: { type: Boolean, default: false },
  pushed: { type: Boolean, default: false },
  pushedAt: { type: Date, default: null },
  scrapedAt: { type: Date, default: Date.now }
});

// Create index for fast duplicate checks
stagingLeadSchema.index({ name: 1, city: 1 }, { unique: false });
stagingLeadSchema.index({ mapsLink: 1 }, { unique: false });

module.exports = mongoose.model('StagingLead', stagingLeadSchema);
