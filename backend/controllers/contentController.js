const Settings = require('../models/Settings');

// @desc    Get all content (footers, etc)
// @route   GET /api/content
// @access  Public
const getContent = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({
      success: true,
      clientFooter: settings.clientFooter || null,
      vendorFooter: settings.vendorFooter || null
    });
  } catch (error) {
    console.error('getContent Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update client and vendor footer content
// @route   PATCH /api/content/footer
// @access  Admin
const updateFooter = async (req, res) => {
  try {
    const { clientFooter, vendorFooter } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (clientFooter) settings.clientFooter = clientFooter;
    if (vendorFooter) settings.vendorFooter = vendorFooter;

    // We must tell Mongoose that these Mixed type objects have changed
    settings.markModified('clientFooter');
    settings.markModified('vendorFooter');

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Footer content updated successfully.',
      clientFooter: settings.clientFooter,
      vendorFooter: settings.vendorFooter
    });
  } catch (error) {
    console.error('updateFooter Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getContent, updateFooter };
