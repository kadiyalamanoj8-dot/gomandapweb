const Vendor = require('../models/Vendor');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');

// 60 seconds TTL
const vendorCache = new NodeCache({ stdTTL: 60 });

const generateToken = (id) => {
  return jwt.sign({ id, role: 'vendor' }, process.env.JWT_SECRET || 'fallback_secret', {
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
      // Vendor exists and completed onboarding
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
      // New vendor
      return res.json({
        success: true,
        action: 'onboard',
        phoneNumber
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error during auth sync' });
  }
};

// @desc    Sync Google Auth (Login or Redirect to Onboard)
// @route   POST /api/vendors/auth/google
// @access  Public
const syncGoogleAuth = async (req, res) => {
  try {
    const { email, googleId, name, photoUrl } = req.body;
    
    // Find a vendor with this email or googleId
    let vendor = await Vendor.findOne({ 
      $or: [ { email: email }, { googleId: googleId } ] 
    });

    if (vendor && vendor.status !== 'draft') {
      // Vendor exists and completed onboarding, make sure googleId is updated
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
      // Vendor is in draft state, return their draft to resume
      return res.json({
        success: true,
        action: 'resume',
        vendorId: vendor._id,
        token: generateToken(vendor._id)
      });
    } else {
      // Completely new vendor
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error during Google auth sync' });
  }
};

// @desc    Update a vendor draft progress
// @route   PATCH /api/vendors/draft/:id
// @access  Public
const updateDraft = async (req, res) => {
  try {
    const data = req.body;
    let updateFields = { ...data };

    // Handle Uploaded Files
    if (req.files && req.files.length > 0) {
      updateFields.portfolioImages = req.files.map(file => file.path);
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
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendorCache.flushAll(); // Clear cache on update
    res.status(200).json({ success: true, data: updatedVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all approved vendors (For Client App)
// @route   GET /api/vendors
// @access  Public
const getApprovedVendors = async (req, res) => {
  try {
    const cacheKey = 'approved_' + JSON.stringify(req.query);
    if (vendorCache.has(cacheKey)) {
      return res.status(200).json(vendorCache.get(cacheKey));
    }

    const { category, categories, inHouseCatering, inHousePhotography, inHouseDecorations, lat, lng, radiusInKm, locName, date, q } = req.query;
    
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
      // Text search fallback across address fields
      query.$text = { $search: locName };
    }

    // Global Search (Advanced Search)
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } }
      ];
    }

    // In-house services filtering (stored in deepFeatures)
    if (inHouseCatering === 'true') {
      query['deepFeatures.inHouseCatering'] = 'Yes';
    }
    if (inHousePhotography === 'true') {
      query['deepFeatures.inHousePhotography'] = 'Yes';
    }
    if (inHouseDecorations === 'true') {
      query['deepFeatures.inHouseDecorations'] = 'Yes';
    }

    // Dynamic deepFeatures filtering from custom schemas
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('dynamic_')) {
        const featureKey = key.replace('dynamic_', '');
        query[`deepFeatures.${featureKey}`] = req.query[key];
      }
    });

    // Date availability filtering
    if (date) {
      // We want to exclude vendors who have a blocked date matching the query date
      // Note: This is a simplistic match. For production, date range queries are better.
      const searchDate = new Date(date);
      // Create a start and end of day to match the exact day
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

    const vendors = await Vendor.find(query).lean();
    const responseData = { success: true, count: vendors.length, data: vendors };
    vendorCache.set(cacheKey, responseData);
    
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).lean();
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all vendors (For Admin App)
// @route   GET /api/vendors/admin/all
// @access  Public (Should be protected in prod)
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
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update vendor status (approve/reject)
// @route   PATCH /api/vendors/:id/status
// @access  Public (Should be protected in prod)
const updateVendorStatus = async (req, res) => {
  try {
    const { status, adminFeedback } = req.body; // 'approved' or 'rejected_with_feedback'
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

    vendorCache.flushAll(); // Clear cache
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update location lock status
// @route   PATCH /api/vendors/:id/location-lock
// @access  Public (Should be protected in prod)
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

    vendorCache.flushAll(); // Clear cache
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update vendor settings (availability, pricing)
// @route   PATCH /api/vendors/:id/settings
// @access  Private/Vendor
const updateVendorSettings = async (req, res) => {
  try {
    const { bookingSettings, pricing } = req.body;
    
    let updateFields = {};
    if (bookingSettings) updateFields.bookingSettings = bookingSettings;
    if (pricing) updateFields.pricing = pricing;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendorCache.flushAll();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin update vendor controls (monetization, featured, price override)
// @route   PATCH /api/vendors/:id/admin-settings
// @access  Private/Admin
const updateAdminVendorSettings = async (req, res) => {
  try {
    const { monetizationModel, commissionRate, subscriptionExpiry, isFeatured, adminOverridePrice } = req.body;
    
    let updateFields = {};
    if (monetizationModel) updateFields['bookingSettings.monetizationModel'] = monetizationModel;
    if (commissionRate !== undefined) updateFields['bookingSettings.commissionRate'] = commissionRate;
    if (subscriptionExpiry) updateFields['bookingSettings.subscriptionExpiry'] = subscriptionExpiry;
    if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;
    if (adminOverridePrice !== undefined) updateFields['pricing.adminOverridePrice'] = adminOverridePrice;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    vendorCache.flushAll();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
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
  updateAdminVendorSettings
};
