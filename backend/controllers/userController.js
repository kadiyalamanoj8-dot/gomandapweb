const User = require('../models/User');

// @desc    Get all users (clients) for admin panel
// @route   GET /api/users/admin/all
// @access  Public (Should be protected in prod)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('savedVendors', 'name category')
      .populate('inquiries.vendorId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    // Sort by latest login history client-side or we can just send it raw
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error fetching users' });
  }
};

module.exports = {
  getAllUsers
};
