const Vendor = require('../models/Vendor');
const Settings = require('../models/Settings');

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
            isLocationLocked: loc.isLocationLocked || false
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
    const { category, inHouseCatering, inHousePhotography, inHouseDecorations, lat, lng, radiusInKm, locName } = req.query;
    
    // Fetch disabled categories from Settings to exclude them
    const settings = await Settings.findOne();
    const disabledCategories = settings?.disabledCategories || [];

    let query = { status: 'approved' };
    
    // Exclude vendors whose category is disabled
    if (disabledCategories.length > 0) {
      query.category = { $nin: disabledCategories };
    }
    
    // If admin is filtering by a specific category, override
    if (category) {
      query.category = category;
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

    const vendors = await Vendor.find(query);
    res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
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
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vendors.length, data: vendors });
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

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createDraft,
  updateDraft,
  getApprovedVendors,
  getVendorById,
  getAllVendors,
  updateVendorStatus,
  updateLocationLock
};
