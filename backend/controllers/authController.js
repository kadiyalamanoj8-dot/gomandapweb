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


// @desc    Google OAuth Login
// @route   POST /api/auth/google
const authGoogle = async (req, res) => {
  try {
    const { token, deviceInfo, ipAddress } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google authentication token is missing' });
    }

    // Verify token with Google (Support both id_token and access_token)
    let payload;
    try {
      // First try as id_token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || '525881024479-s9c7umr8e5r5mrtqdld53o6o1mvar4l0.apps.googleusercontent.com',
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      // If it fails, try as access_token (from custom useGoogleLogin button)
      try {
        const fetch = (await import('node-fetch')).default || global.fetch;
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Invalid access token');
        }
        payload = await response.json();
      } catch (accessErr) {
        console.error("Google Token Verification Failed (both id_token and access_token):", verifyError.message, accessErr.message);
        return res.status(401).json({ success: false, message: 'Invalid Google token' });
      }
    }
    
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Unable to extract email from Google token' });
    }

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
    } else {
      // User exists, update Google specific fields to keep them fresh
      user.googleId = googleId;
      if (picture && user.profilePicture !== picture) {
        user.profilePicture = picture;
      }
      if (name && user.name !== name) {
        user.name = name;
      }
    }

    // Add to login history
    user.loginHistory.push({
      loginTime: new Date(),
      deviceInfo: deviceInfo || req.headers['user-agent'] || 'Unknown Device',
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
    console.error("Google Auth Internal Error:", error);
    res.status(500).json({ success: false, message: 'An internal error occurred during Google authentication' });
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

module.exports = { authAdmin, authGoogle, getUsers, updateUserLocation };
