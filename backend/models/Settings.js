const mongoose = require('mongoose');

// Singleton settings document for the entire platform.
// We always use findOneAndUpdate with upsert:true to ensure there is exactly one record.
const SettingsSchema = new mongoose.Schema(
  {
    disabledCategories: {
      type: [String],
      default: []
    },
    activeLanguages: {
      type: [String],
      default: ['en', 'hi', 'te', 'ta', 'mr']
    },
    clientUI: {
      use3DCarousel: { type: Boolean, default: true },
      carouselImages: { type: [String], default: [] },
      marqueeWidth: { type: String, default: '100vw' },
      marqueeHeight: { type: String, default: '100%' },
      marqueePositionY: { type: String, default: '0px' },
      marqueeSpeed: { type: Number, default: 3 }
    },
    clientFooter: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    vendorFooter: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', SettingsSchema);
