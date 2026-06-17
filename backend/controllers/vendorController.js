const Vendor = require('../models/Vendor');
const Inquiry = require('../models/Inquiry');
const Booking = require('../models/Booking');
const { uploadToOracleCloud } = require('../utils/oracleStorage');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');

// 60 seconds TTL
const vendorCache = new NodeCache({ stdTTL: 60 });

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set!');
  }
  return jwt.sign({ id, role: 'vendor' }, process.env.JWT_SECRET || 'fallback_secret_change_in_production', {
    expiresIn: '30d',
  });
};

// @desc    Initialize a vendor draft at Step 1
// @route   POST /api/vendors/draft
// @access  Public
const createDraft = async (req, res) => {
  try {
    const newVendor = new Vendor({
      ...req.body,
      status: 'draft',
      currentStep: 1
    });
    const savedVendor = await newVendor.save();
    res.status(201).json({ success: true, data: savedVendor });
  } catch (error) {
    console.error('createDraft error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Sync Vendor Auth (Login or Redirect to Onboard)
// @route   POST /api/vendors/auth/sync
// @access  Public
const syncVendorAuth = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Find a vendor with this phone number
    const vendor = await Vendor.findOne({ 'contact.phone': phoneNumber });

    if (vendor && vendor.status !== 'draft') {
      return res.json({
        success: true,
        action: 'dashboard',
        vendorId: vendor._id,
        token: generateToken(vendor._id)
      });
    } else if (vendor && vendor.status === 'draft') {
      return res.json({
        success: true,
        action: 'resume',
        vendorId: vendor._id,
        token: generateToken(vendor._id)
      });
    } else {
      return res.json({
        success: true,
        action: 'onboard',
        phoneNumber
      });
    }
  } catch (error) {
    console.error('syncVendorAuth error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error during auth sync' });
  }
};

// @desc    Sync Google Auth (Login or Redirect to Onboard)
// @route   POST /api/vendors/auth/google
// @access  Public
const syncGoogleAuth = async (req, res) => {
  try {
    const { email, googleId, name, photoUrl } = req.body;
    
    let vendor = await Vendor.findOne({ 
      $or: [ { email: email }, { googleId: googleId } ] 
    });

    if (vendor && vendor.status !== 'draft') {
      if (!vendor.googleId) {
        vendor.googleId = googleId;
        vendor.photoUrl = photoUrl;
        await vendor.save();
      }
      return res.json({
        success: true,
        action: 'dashboard',
        vendorId: vendor._id,
        token: generateToken(vendor._id)
      });
    } else if (vendor && vendor.status === 'draft') {
      return res.json({
        success: true,
        action: 'resume',
        vendorId: vendor._id,
        token: generateToken(vendor._id)
      });
    } else {
      return res.json({
        success: true,
        action: 'onboard',
        email,
        googleId,
        name,
        photoUrl
      });
    }
  } catch (error) {
    console.error('syncGoogleAuth error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error during Google auth sync' });
  }
};

// @desc    Update a vendor draft progress
// @route   PATCH /api/vendors/draft/:id
// @access  Public (vendor identity validated via token)
const updateDraft = async (req, res) => {
  try {
    // SECURITY FIX BUG-04: Validate vendor ownership via JWT token
    // The token is set by the auth middleware when 'protect' is applied on the route
    // For draft updates during onboarding (no token yet), we pass the vendorId in the body and match it
    const vendorIdFromParams = req.params.id;

    // If a vendor token is present (req.user set by protect middleware), verify ownership
    if (req.user && req.user._id && req.user._id.toString() !== vendorIdFromParams) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vendor profile' });
    }

    const data = req.body;
    let updateFields = { ...data };

    // Handle Uploaded Files via Oracle Cloud
    if (req.files) {
      try {
        // Handle Portfolio Images
        if (req.files.portfolioImages && req.files.portfolioImages.length > 0) {
          const uploadPromises = req.files.portfolioImages.map(file => 
            uploadToOracleCloud(file.buffer, file.originalname, 'portfolios')
          );
          updateFields.portfolioImages = await Promise.all(uploadPromises);
        }

        // Handle Verification Documents
        const docTypes = ['gst', 'pan', 'fssai', 'cheque'];
        let uploadedDocs = [];
        for (const type of docTypes) {
          const fieldName = `doc_${type}`;
          if (req.files[fieldName] && req.files[fieldName][0]) {
            const file = req.files[fieldName][0];

            // SECURITY FIX: Validate file type (only images and PDFs allowed)
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (!allowedMimes.includes(file.mimetype)) {
              return res.status(400).json({ success: false, message: `Invalid file type for ${type}. Only JPG, PNG, WEBP, and PDF are allowed.` });
            }

            const url = await uploadToOracleCloud(file.buffer, file.originalname, 'documents');
            uploadedDocs.push({ type, url, status: 'pending' });
          }
        }
        
        if (uploadedDocs.length > 0) {
          updateFields.$push = { documents: { $each: uploadedDocs } };
        }
      } catch (err) {
        console.error("Upload failed:", err);
        return res.status(500).json({ success: false, message: 'Failed to upload files.' });
      }
    }

    // Parse nested JSON strings if present (FormData sends strings)
    if (typeof data.contact === 'string') updateFields.contact = JSON.parse(data.contact);
    if (typeof data.address === 'string') updateFields.address = JSON.parse(data.address);
    if (typeof data.deepFeatures === 'string') updateFields.deepFeatures = JSON.parse(data.deepFeatures);
    if (typeof data.banking === 'string') updateFields.banking = JSON.parse(data.banking);
    if (typeof data.customBlocks === 'string') updateFields.customBlocks = JSON.parse(data.customBlocks);
    if (typeof data.locationData === 'string') {
        const loc = JSON.parse(data.locationData);
        updateFields.locationData = {
            type: 'Point',
            coordinates: loc.coordinates || [0,0],
            googleMapsLink: loc.googleMapsLink || '',
            isLocationLocked: loc.isLocationLocked || false,
            parsedAddress: loc.parsedAddress || {
              village: '',
              mandal: '',
              district: '',
              state: ''
            }
        };
    }

    // If final step, change status to pending
    if (updateFields.isFinalStep) {
      updateFields.status = 'pending';
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorIdFromParams,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendorCache.flushAll();
    res.status(200).json({ success: true, data: updatedVendor });
  } catch (error) {
    console.error('updateDraft error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all approved vendors (For Client App) with pagination
// @route   GET /api/vendors
// @access  Public
const getApprovedVendors = async (req, res) => {
  try {
    const cacheKey = 'approved_' + JSON.stringify(req.query);
    if (vendorCache.has(cacheKey)) {
      return res.status(200).json(vendorCache.get(cacheKey));
    }

    const { category, categories, lat, lng, radiusInKm, locName, date, q, capacity, page = 1, limit = 20 } = req.query;
    
    // Fetch disabled categories from Settings to exclude them
    const settings = await Settings.findOne();
    const disabledCategories = settings?.disabledCategories || [];

    let query = { status: 'approved' };
    
    // Exclude vendors whose category is disabled
    if (disabledCategories.length > 0) {
      query.category = { $nin: disabledCategories };
    }
    
    // If admin or client is filtering by specific categories
    if (categories) {
      const categoryArray = categories.split(',').map(c => c.trim());
      query.category = { ...query.category, $in: categoryArray };
    } else if (category) {
      query.category = { ...query.category, $eq: category };
    }

    // Geospatial Radius Query
    if (lat && lng) {
      const radiusInMeters = (parseInt(radiusInKm) || 50) * 1000;
      query.locationData = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      };
    } else if (locName) {
      query.$text = { $search: locName };
    }

    // Global Search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } }
      ];
    }

    // Dynamic deepFeatures filtering from custom schemas
    const allQueryKeys = Object.keys(req.query);
    const dynamicKeys = new Set(allQueryKeys.filter(k => k.startsWith('dynamic_')));
    dynamicKeys.forEach(key => {
      const featureKey = key.replace('dynamic_', '');
      const values = Array.isArray(req.query[key]) ? req.query[key] : [req.query[key]];
      query[`deepFeatures.${featureKey}`] = { $in: values };
    });

    // Date availability filtering
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      
      query['bookingSettings.availability'] = {
        $not: {
          $elemMatch: {
            date: { $gte: startOfDay, $lte: endOfDay },
            isBlocked: true
          }
        }
      };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let vendors = await Vendor.find(query).lean().skip(skip).limit(limitNum);
    const totalCount = await Vendor.countDocuments(query);

    // Post-fetch capacity range filtering (BUG-13 FIX: check multiple field names)
    if (capacity) {
      const capMap = {
        'less-100':  [0, 99],
        '100-250':   [100, 250],
        '250-500':   [250, 500],
        '500-1000':  [500, 1000],
        '1000+':     [1000, Infinity]
      };
      const range = capMap[capacity];
      if (range) {
        vendors = vendors.filter(v => {
          // BUG-13 FIX: Check multiple capacity field names
          const capValue = v.deepFeatures?.capacity 
            || v.deepFeatures?.ballroomCapacityTheatre
            || v.deepFeatures?.overnightStayCapacity;
          const cap = parseInt(capValue);
          if (isNaN(cap)) return false;
          return cap >= range[0] && cap <= range[1];
        });
      }
    }

    const responseData = { 
      success: true, 
      count: vendors.length, 
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
      data: vendors 
    };
    vendorCache.set(cacheKey, responseData);
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('getApprovedVendors error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single vendor by ID (increments view count)
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = async (req, res) => {
  try {
    // Increment profile views atomically
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $inc: { profileViews: 1 } },
      { new: true }
    ).lean();
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('getVendorById error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all vendors (For Admin App) with pagination
// @route   GET /api/vendors/admin/all
// @access  Private/Admin
const getAllVendors = async (req, res) => {
  try {
    if (vendorCache.has('all_admin')) {
      return res.status(200).json(vendorCache.get('all_admin'));
    }

    const vendors = await Vendor.find().sort({ createdAt: -1 }).lean();
    const responseData = { success: true, count: vendors.length, data: vendors };
    vendorCache.set('all_admin', responseData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('getAllVendors error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update vendor status (approve/reject)
// @route   PATCH /api/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = async (req, res) => {
  try {
    const { status, adminFeedback } = req.body;
    if (!['approved', 'rejected', 'rejected_with_feedback', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let updateData = { status };
    if (adminFeedback) {
      updateData.adminFeedback = adminFeedback;
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendorCache.flushAll();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('updateVendorStatus error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update location lock status
// @route   PATCH /api/vendors/:id/location-lock
// @access  Private/Admin
const updateLocationLock = async (req, res) => {
  try {
    const { isLocationLocked } = req.body;
    
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: { 'locationData.isLocationLocked': isLocationLocked } },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendorCache.flushAll();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('updateLocationLock error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update vendor settings (availability, pricing)
// @route   PATCH /api/vendors/:id/settings
// @access  Private/Vendor (ownership verified)
const updateVendorSettings = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // SECURITY FIX BUG-17: Verify the authenticated vendor owns this profile
    // req.user is set by the 'protect' middleware from the JWT
    if (req.user && req.user._id && req.user._id.toString() !== vendorId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vendor profile' });
    }

    const { bookingSettings, pricing } = req.body;
    
    let updateFields = {};
    if (bookingSettings) updateFields.bookingSettings = bookingSettings;
    if (pricing) updateFields.pricing = pricing;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateFields },
      { new: true }
    );

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendorCache.flushAll();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('updateVendorSettings error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin update vendor controls (monetization, featured, price override)
// @route   PATCH /api/vendors/:id/admin-settings
// @access  Private/Admin
const updateAdminVendorSettings = async (req, res) => {
  try {
    const { monetizationModel, commissionRate, subscriptionExpiry, isFeatured, adminOverridePrice, customBlocks } = req.body;
    
    let updateFields = {};
    if (monetizationModel) updateFields['bookingSettings.monetizationModel'] = monetizationModel;
    if (commissionRate !== undefined) updateFields['bookingSettings.commissionRate'] = commissionRate;
    if (subscriptionExpiry) updateFields['bookingSettings.subscriptionExpiry'] = subscriptionExpiry;
    if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;
    if (adminOverridePrice !== undefined) updateFields['pricing.adminOverridePrice'] = adminOverridePrice;
    if (customBlocks) updateFields.customBlocks = customBlocks;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendorCache.flushAll();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('updateAdminVendorSettings error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get real analytics for a vendor (views, inquiries, revenue)
// @route   GET /api/vendors/:id/analytics
// @access  Private/Vendor
const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.params.id;
    
    const vendor = await Vendor.findById(vendorId).select('profileViews name').lean();
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    // Get inquiry stats
    const totalInquiries = await Inquiry.countDocuments({ vendorId });
    const newInquiries = await Inquiry.countDocuments({ vendorId, status: 'new' });
    const repliedInquiries = await Inquiry.countDocuments({ vendorId, status: 'replied' });

    // Get booking/revenue stats
    const bookings = await Booking.find({ 
      vendorId,
      status: { $in: ['confirmed', 'completed'] }
    }).select('totalAmount vendorPayoutAmount platformFee createdAt').lean();

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.vendorPayoutAmount || b.totalAmount || 0), 0);
    const confirmedBookings = bookings.length;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = {};
    bookings.filter(b => new Date(b.createdAt) >= sixMonthsAgo).forEach(b => {
      const month = new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += (b.vendorPayoutAmount || b.totalAmount || 0);
    });

    // Recent inquiries
    const recentInquiries = await Inquiry.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        profileViews: vendor.profileViews || 0,
        totalInquiries,
        newInquiries,
        repliedInquiries,
        confirmedBookings,
        totalRevenue,
        monthlyRevenue: monthlyData,
        recentInquiries
      }
    });
  } catch (error) {
    console.error('getVendorAnalytics error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createDraft,
  syncVendorAuth,
  syncGoogleAuth,
  updateDraft,
  getApprovedVendors,
  getVendorById,
  getAllVendors,
  updateVendorStatus,
  updateLocationLock,
  updateVendorSettings,
  updateAdminVendorSettings,
  getVendorAnalytics
};
