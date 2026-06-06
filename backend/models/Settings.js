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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', SettingsSchema);
