const Settings = require('../models/Settings');

// @desc    Get global platform settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    // Use findOne and create defaults if not yet initialized
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ disabledCategories: [] });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('getSettings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle a single category on or off
// @route   PATCH /api/settings/categories/toggle
// @access  Admin
const toggleCategory = async (req, res) => {
  try {
    const { category, enabled } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ disabledCategories: [] });
    }

    if (enabled) {
      // Remove from disabled list (re-enable the category)
      settings.disabledCategories = settings.disabledCategories.filter(c => c !== category);
    } else {
      // Add to disabled list (disable the category)
      if (!settings.disabledCategories.includes(category)) {
        settings.disabledCategories.push(category);
      }
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: `Category "${category}" has been ${enabled ? 'enabled' : 'disabled'}.`,
      data: settings
    });
  } catch (error) {
    console.error('toggleCategory Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle a single language on or off
// @route   PATCH /api/settings/languages/toggle
// @access  Admin
const toggleLanguage = async (req, res) => {
  try {
    const { language, enabled } = req.body;

    if (!language) {
      return res.status(400).json({ success: false, message: 'Language code is required.' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ disabledCategories: [], activeLanguages: ['en', 'hi', 'te', 'ta', 'mr'] });
    }

    if (enabled) {
      if (!settings.activeLanguages.includes(language)) {
        settings.activeLanguages.push(language);
      }
    } else {
      settings.activeLanguages = settings.activeLanguages.filter(l => l !== language);
    }

    // Ensure 'en' is never disabled completely as a fallback
    if (!settings.activeLanguages.includes('en')) {
      settings.activeLanguages.push('en');
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: `Language "${language}" has been ${enabled ? 'enabled' : 'disabled'}.`,
      data: settings
    });
  } catch (error) {
    console.error('toggleLanguage Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Client UI settings (Admin)
// @route   PATCH /api/settings/client-ui
// @access  Admin
const updateClientUI = async (req, res) => {
  try {
    const { use3DCarousel, carouselImages, marqueeWidth, marqueeHeight, marqueePositionY, marqueeSpeed } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (!settings.clientUI) {
      settings.clientUI = { use3DCarousel: true, carouselImages: [] };
    }

    if (use3DCarousel !== undefined) settings.clientUI.use3DCarousel = use3DCarousel;
    if (carouselImages !== undefined) settings.clientUI.carouselImages = carouselImages;
    if (marqueeWidth !== undefined) settings.clientUI.marqueeWidth = marqueeWidth;
    if (marqueeHeight !== undefined) settings.clientUI.marqueeHeight = marqueeHeight;
    if (marqueePositionY !== undefined) settings.clientUI.marqueePositionY = marqueePositionY;
    if (marqueeSpeed !== undefined) settings.clientUI.marqueeSpeed = marqueeSpeed;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Client UI settings updated.',
      data: settings
    });
  } catch (error) {
    console.error('updateClientUI Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update home page content settings (Event Types, Why Us)
// @route   PATCH /api/settings/home-content
// @access  Admin
const updateHomeContent = async (req, res) => {
  try {
    const { eventTypes, whyUsFeatures } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (eventTypes !== undefined) settings.eventTypes = eventTypes;
    if (whyUsFeatures !== undefined) {
      settings.whyUsFeatures = whyUsFeatures;
      settings.markModified('whyUsFeatures');
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Home content settings updated.',
      data: settings
    });
  } catch (error) {
    console.error('updateHomeContent Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getSettings, toggleCategory, toggleLanguage, updateClientUI, updateHomeContent };
