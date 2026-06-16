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
    eventTypes: {
      type: mongoose.Schema.Types.Mixed,
      default: [
        { name: 'Pelli / Shaadi (The Grand Wedding)', iconName: 'Heart', mappedCategories: ['Banquet Halls', 'Kalyana Mandapams'] },
        { name: 'Engagement / Nishchithartham', iconName: 'Ring', mappedCategories: ['Banquet Halls', 'Party & Mini Halls'] },
        { name: 'Sangeet & Mehendi Night', iconName: 'Music', mappedCategories: ['Open Lawns & Farmhouses', 'Party & Mini Halls'] },
        { name: 'Reception', iconName: 'GlassWater', mappedCategories: ['Banquet Halls', 'Resorts & Destination Venues'] },
        { name: 'Corporate Events & MICE', iconName: 'Briefcase', mappedCategories: ['5-Star Hotels', 'Resorts & Destination Venues'] }
      ]
    },
    whyUsFeatures: {
      type: mongoose.Schema.Types.Mixed,
      default: [
        {
          title: 'Verified Vendors',
          description: 'Every vendor on our platform undergoes a strict background check for quality and reliability.',
          iconName: 'CheckCircle'
        },
        {
          title: 'Best Price Guarantee',
          description: 'We ensure you get the most competitive rates and transparent pricing with no hidden fees.',
          iconName: 'Tag'
        },
        {
          title: '3D Virtual Tours',
          description: 'Explore venues from the comfort of your home with our immersive 3D walkthroughs.',
          iconName: 'Video'
        },
        {
          title: 'Expert Planners',
          description: 'Get matched with dedicated wedding planners to bring your dream celebration to life.',
          iconName: 'Users'
        }
      ]
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
