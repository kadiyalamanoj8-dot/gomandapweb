const mongoose = require('mongoose');

// Dynamic Content Singleton Document
// Stores SEO tags and Footer configurations for both Client and Vendor apps
const DynamicContentSchema = new mongoose.Schema(
  {
    // Arrays for SEO configs
    seoSettings: [
      {
        targetApp: { type: String, enum: ['client', 'vendor'], required: true },
        page: { type: String, required: true }, // e.g., 'global', 'home', 'search'
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        keywords: { type: String, default: '' }
      }
    ],
    // Footer Configuration
    clientFooter: {
      aboutText: { type: String, default: '' },
      columns: [
        {
          title: { type: String, required: true },
          links: [
            {
              label: { type: String, required: true },
              url: { type: String, required: true }
            }
          ]
        }
      ],
      socialLinks: [
        {
          platform: { type: String, required: true }, // e.g. 'instagram', 'facebook'
          url: { type: String, required: true }
        }
      ],
      copyrightText: { type: String, default: '© Gomandap. All rights reserved.' },
      contactEmail: { type: String, default: '' },
      contactPhone: { type: String, default: '' }
    },
    vendorFooter: {
      aboutText: { type: String, default: '' },
      columns: [
        {
          title: { type: String, required: true },
          links: [
            {
              label: { type: String, required: true },
              url: { type: String, required: true }
            }
          ]
        }
      ],
      socialLinks: [
        {
          platform: { type: String, required: true },
          url: { type: String, required: true }
        }
      ],
      copyrightText: { type: String, default: '© Gomandap Vendor Platform. All rights reserved.' },
      contactEmail: { type: String, default: '' },
      contactPhone: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DynamicContent', DynamicContentSchema);
