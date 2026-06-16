const Testimonial = require('../models/Testimonial');

// @desc    Get all active testimonials (for client)
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all testimonials (for admin)
// @route   GET /api/testimonials/admin
// @access  Admin
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Admin
const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Admin
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};
