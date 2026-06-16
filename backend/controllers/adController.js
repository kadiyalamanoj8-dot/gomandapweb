const AdPackage = require('../models/AdPackage');

// GET /api/ads/package — Fetch current ad package settings
const getAdPackage = async (req, res) => {
  try {
    let pkg = await AdPackage.findOne();
    if (!pkg) {
      // Auto-seed default on first fetch
      pkg = await AdPackage.create({});
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/ads/package — Update ad package settings (Admin)
const updateAdPackage = async (req, res) => {
  try {
    const { monthlyPrice, isActive, features } = req.body;
    let pkg = await AdPackage.findOne();
    if (!pkg) {
      pkg = await AdPackage.create({ monthlyPrice, isActive, features });
    } else {
      if (monthlyPrice !== undefined) pkg.monthlyPrice = monthlyPrice;
      if (isActive !== undefined) pkg.isActive = isActive;
      if (features !== undefined) pkg.features = features;
      await pkg.save();
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdPackage, updateAdPackage };
