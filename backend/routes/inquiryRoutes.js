const express = require('express');
const router = express.Router();
const { createInquiry, getVendorInquiries, updateInquiryStatus } = require('../controllers/inquiryController');

router.post('/', createInquiry);
router.get('/vendor/:vendorId', getVendorInquiries);
router.patch('/:id/status', updateInquiryStatus);

module.exports = router;
