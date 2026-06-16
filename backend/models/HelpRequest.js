const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  eventDate: {
    type: Date
  },
  eventType: {
    type: String
  },
  requiredVendors: [{
    type: String
  }],
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Resolved'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
