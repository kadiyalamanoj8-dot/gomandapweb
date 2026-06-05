const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  loginTime: { type: Date, default: Date.now },
  deviceInfo: { type: String },
  ipAddress: { type: String },
  authProvider: { type: String, default: 'phone' } // 'phone' or 'google'
});

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  googleId: { type: String },
  firebaseUid: { type: String }, 
  name: { type: String },
  profilePicture: { type: String },
  loginHistory: [loginHistorySchema],
  savedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  inquiries: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
