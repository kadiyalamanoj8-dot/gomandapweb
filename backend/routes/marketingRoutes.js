const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');

router.post('/contacts/import', marketingController.importContacts);
router.get('/contacts', marketingController.getContacts);
router.put('/contacts/:id/status', marketingController.updateStatus);
router.post('/email/send/:id', marketingController.sendEmail);

module.exports = router;
