const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '565529529704-fgebb7t4aebp3lnpjp70rdn739epv207.apps.googleusercontent.com');

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
    const { totpToken } = req.body;

    const admin = await Admin.findOne({ username: 'admin' });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (!totpToken) {
      return res.status(400).json({ success: false, message: 'Authenticator code required' });
    }

    // Verify the provided token
    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: totpToken,
      window: 1 // allow 30 seconds clock drift before/after
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Invalid authentication code' });
    }

    // Valid 2FA, issue token
    res.json({
      success: true,
      _id: admin._id,
      username: admin.username,
      token: generateToken(admin._id, 'admin'),
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Setup 2FA for Admin
// @route   POST /api/auth/admin/2fa/setup
// @access  Private (Admin)
const setup2FA = async (req, res) => {
  try {
    const { username } = req.body; // In a real app, use req.user from JWT middleware, but we pass username for simplicity
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `Gomandap Admin (${username})`
    });

    // Generate QR Code data URL
    qrcode.toDataURL(secret.otpauth_url, async (err, data_url) => {
      if (err) return res.status(500).json({ success: false, message: 'Error generating QR Code' });
      
      res.json({
        success: true,
        secret: secret.base32,
        qrCode: data_url
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify and Enable 2FA for Admin
// @route   POST /api/auth/admin/2fa/verify
// @access  Private (Admin)
const verify2FA = async (req, res) => {
  try {
    const { username, token, secret } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    // Verify the token using the provided secret
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (verified) {
      admin.twoFactorSecret = secret;
      admin.isTwoFactorEnabled = true;
      await admin.save();
      res.json({ success: true, message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid authentication code' });
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
        audience: process.env.GOOGLE_CLIENT_ID || '565529529704-fgebb7t4aebp3lnpjp70rdn739epv207.apps.googleusercontent.com',
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

module.exports = { authAdmin, setup2FA, verify2FA, authGoogle, getUsers, updateUserLocation };
