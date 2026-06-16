const mongoose = require('mongoose');

const adPackageSchema = new mongoose.Schema({
  monthlyPrice: { type: Number, default: 2000 },
  isActive: { type: Boolean, default: true },
  features: {
    type: [String],
    default: [
      'Top placement in search results',
      'Distinct shimmering gold animated card',
      'Verified "Sponsored" badge',
      'Priority customer support'
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('AdPackage', adPackageSchema);
