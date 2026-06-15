const mongoose = require('mongoose');

const cartOrderSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientEmail: { type: String },
  eventType: { type: String, default: 'Wedding' },
  
  // Cart items
  items: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String },
    vendorCategory: { type: String },
    serviceDate: { type: Date, required: true },
    quotedPrice: { type: Number, default: 0 },
    
    // Status per vendor
    status: { 
      type: String, 
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], 
      default: 'Pending' 
    },
    vendorNotes: { type: String }
  }],

  clientNotes: { type: String },
  totalAmount: { type: Number, default: 0 },

  // Global cart order status
  globalStatus: {
    type: String,
    enum: ['New', 'Processing', 'Confirmed', 'Cancelled'],
    default: 'New'
  }

}, { timestamps: true });

module.exports = mongoose.model('CartOrder', cartOrderSchema);
