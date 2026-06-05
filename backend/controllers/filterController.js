const FilterSchema = require('../models/FilterSchema');

// @desc    Get dynamic filters based on requested category groups
// @route   GET /api/filters
// @access  Public
const getFilters = async (req, res) => {
  try {
    const { groups } = req.query; // e.g., ?groups=VENUE,PHOTO
    let query = {};
    
    if (groups) {
      const groupArray = groups.split(',').map(g => g.trim().toUpperCase());
      query.categoryGroup = { $in: groupArray };
    }

    const schemas = await FilterSchema.find(query);
    res.status(200).json({ success: true, count: schemas.length, data: schemas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching filters' });
  }
};

// @desc    Create or update a filter schema (For Admin panel)
// @route   POST /api/filters
// @access  Public (Should be protected)
const upsertFilterSchema = async (req, res) => {
  try {
    const { categoryGroup, filters } = req.body;
    
    const schema = await FilterSchema.findOneAndUpdate(
      { categoryGroup },
      { filters },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ success: true, data: schema });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error updating filters' });
  }
};

module.exports = {
  getFilters,
  upsertFilterSchema
};
