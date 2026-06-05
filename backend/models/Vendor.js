const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // Identity
  name: { type: String, default: '' },
  category: { type: String, default: '' },
  ownerName: { type: String, default: '' },
  
  // Contact
  contact: {
    phone: { type: String, default: '' },
    whatsapp: { type: String },
    email: { type: String }
  },

  // Location
  address: {
    street: { type: String, default: '' },
    village: { type: String, default: '' },
    mandal: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String }
  },

  // Geospatial Location (MongoDB GeoJSON Point)
  locationData: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    googleMapsLink: { type: String, default: '' },
    isLocationLocked: { type: Boolean, default: false }
  },

  // Business specific
  gstin: { type: String },
  experience: { type: String },
  
  // Admin Control
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'rejected_with_feedback'], default: 'draft' },
  currentStep: { type: Number, default: 1 },
  adminFeedback: [{
    field: { type: String },
    message: { type: String }
  }],
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },

  // Deep Schema (Dynamic Fields)
  // We use Mixed type because different categories have different schemas
  deepFeatures: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Pricing
  customBlocks: {
    pricingPackages: [{
      title: String,
      desc: String,
      price: String
    }]
  },

  // Banking
  banking: {
    accountName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' }, 
    ifscCode: { type: String, default: '' },
    upiId: { type: String }
  },

  // Portfolio
  portfolioImages: [{ type: String }], // Cloudinary URLs
  profileImageUrl: { type: String } // Main cover image

}, { timestamps: true });

vendorSchema.index({ "locationData": "2dsphere" });
vendorSchema.index({ 
  "address.village": "text", 
  "address.mandal": "text", 
  "address.district": "text", 
  "address.state": "text",
  "address.city": "text"
}, { name: "AddressTextIndex" });

module.exports = mongoose.model('Vendor', vendorSchema);
