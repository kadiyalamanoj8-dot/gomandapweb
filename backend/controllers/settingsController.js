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

module.exports = { getSettings, toggleCategory };
