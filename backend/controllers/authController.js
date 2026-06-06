const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '525881024479-s9c7umr8e5r5mrtqdld53o6o1mvar4l0.apps.googleusercontent.com');

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

// @desc    Google OAuth Login/Sync
// @route   POST /api/auth/google
const authGoogle = async (req, res) => {
  try {
    const { token, deviceInfo, ipAddress } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: '525881024479-s9c7umr8e5r5mrtqdld53o6o1mvar4l0.apps.googleusercontent.com',
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        googleId,
        name,
        profilePicture: picture
      });
    } else if (!user.googleId) {
      // Link existing account
      user.googleId = googleId;
      if (!user.profilePicture) user.profilePicture = picture;
      if (!user.name) user.name = name;
    }

    // Add to login history
    user.loginHistory.push({
      loginTime: new Date(),
      deviceInfo: deviceInfo || 'Unknown Device',
      ipAddress: ipAddress || req.ip || 'Unknown IP',
      authProvider: 'google'
    });

    await user.save();

    res.json({
      success: true,
      _id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      token: generateToken(user._id, 'user'),
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: 'Google Authentication failed' });
  }
};

// @desc    Get all users for Admin Panel
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate('savedVendors', 'name category')
      .populate('inquiries.vendorId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user's last known location (called silently from client)
// @route   PATCH /api/auth/user/location
const updateUserLocation = async (req, res) => {
  try {
    const { userId, latitude, longitude, city, state, country } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    await User.findByIdAndUpdate(userId, {
      lastKnownLocation: { latitude, longitude, city, state, country, updatedAt: new Date() }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { authAdmin, syncUser, authGoogle, getUsers, updateUserLocation };
