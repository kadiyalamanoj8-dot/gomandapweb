const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Optional because we allow "Guest" inquiries as per the implementation plan
  },
  clientName: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
  },
  guestCount: {
    type: String,
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
