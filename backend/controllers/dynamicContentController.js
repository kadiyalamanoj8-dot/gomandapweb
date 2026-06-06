const DynamicContent = require('../models/DynamicContent');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes TTL

// Default initial data if none exists
const defaultData = {
  seoSettings: [
    { targetApp: 'client', page: 'global', title: 'Gomandap - India\'s Premium Event Marketplace', description: 'Find top banquet halls, lawns, and elite wedding vendors.', keywords: 'wedding venues, event planners, gomandap, banquets' },
    { targetApp: 'vendor', page: 'global', title: 'Gomandap Vendor - Grow Your Business', description: 'Join the premier network for event professionals.', keywords: 'wedding vendors, business growth, gomandap vendor' }
  ],
  clientFooter: {
    aboutText: 'Gomandap connects you directly with top-tier event professionals and stunning venues across India.',
    columns: [
      {
        title: 'Platform',
        links: [
          { label: 'Home', url: '/' },
          { label: 'Search Venues', url: '/search?category=Banquet%20Halls' },
          { label: 'For Vendors', url: '/vendor-onboarding' }
        ]
      }
    ],
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/gomandap' }
    ]
  },
  vendorFooter: {
    aboutText: 'The ultimate growth engine for event professionals.',
    columns: [
      {
        title: 'Vendor Hub',
        links: [
          { label: 'Dashboard', url: '/' },
          { label: 'Leads', url: '/leads' }
        ]
      }
    ],
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/company/gomandap' }
    ]
  }
};

// @desc    Get dynamic content (public)
// @route   GET /api/content
// @access  Public
exports.getDynamicContent = async (req, res) => {
  try {
    let content = cache.get("dynamicContent");
    if (content) {
      return res.status(200).json(content);
    }

    content = await DynamicContent.findOne().lean();
    if (!content) {
      // Create default if not exists
      const created = await DynamicContent.create(defaultData);
      content = created.toObject();
    }
    
    cache.set("dynamicContent", content);
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching dynamic content', error: err.message });
  }
};

// @desc    Update dynamic content (Admin only)
// @route   PUT /api/content
// @access  Private/Admin
exports.updateDynamicContent = async (req, res) => {
  try {
    let content = await DynamicContent.findOne();
    
    if (!content) {
      content = new DynamicContent(req.body);
    } else {
      // Update fields
      if (req.body.seoSettings) content.seoSettings = req.body.seoSettings;
      if (req.body.clientFooter) content.clientFooter = req.body.clientFooter;
      if (req.body.vendorFooter) content.vendorFooter = req.body.vendorFooter;
    }
    
    await content.save();
    cache.set("dynamicContent", content.toObject ? content.toObject() : content);
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating dynamic content', error: err.message });
  }
};
