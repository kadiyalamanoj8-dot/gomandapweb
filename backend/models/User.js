const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  loginTime: { type: Date, default: Date.now },
  deviceInfo: { type: String },
  ipAddress: { type: String }
});

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  firebaseUid: { type: String }, // For future real firebase integration
  name: { type: String },
  loginHistory: [loginHistorySchema],
  savedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  inquiries: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
