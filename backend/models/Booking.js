const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Booking details
  bookingDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'admin_intervention'], default: 'pending' },
  userRoleAtBooking: { type: String, enum: ['consumer', 'b2b'], required: true }, // To track whether D2C or B2B

  // Financials
  totalAmount: { type: Number, required: true },
  vendorPriceApplied: { type: Number }, // Standard or B2B price applied at the time
  adminOverridePriceApplied: { type: Number }, // If admin overrode it
  commissionAmount: { type: Number, default: 0 }, // Platform fee (legacy field, keeping for compatibility)
  
  // Advanced Financial Routing (Phase 2)
  platformFee: { type: Number, default: 0 },
  vendorPayoutAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  
  // Custom B2B Quote logic
  isQuoteRequest: { type: Boolean, default: false },
  vendorQuoteNotes: { type: String },
  adminQuoteNotes: { type: String },

  // Cancellation and Admin Intervention
  cancellationReason: { type: String },
  adminInterventionReason: { type: String },
  intervenedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
