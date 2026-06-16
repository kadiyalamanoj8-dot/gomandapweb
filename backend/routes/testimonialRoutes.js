const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');

router.get('/', getTestimonials);
router.get('/admin', getAllTestimonials);
router.post('/', createTestimonial);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);

module.exports = router;
