const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
const authAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync/Login Client User (Firebase Mock/Real)
// @route   POST /api/auth/user/sync
const syncUser = async (req, res) => {
  try {
    const { phoneNumber, deviceInfo, ipAddress } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Create new user
      user = await User.create({ phoneNumber });
    }

    // Add to login history
    user.loginHistory.push({
      loginTime: new Date(),
      deviceInfo: deviceInfo || 'Unknown Device',
      ipAddress: ipAddress || req.ip || 'Unknown IP'
    });

    await user.save();

    res.json({
      success: true,
      _id: user._id,
      phoneNumber: user.phoneNumber,
      token: generateToken(user._id, 'user'),
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users for Admin Panel
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { authAdmin, syncUser, getUsers };
