const express = require('express');
const router = express.Router();
const { createHelpRequest, getHelpRequests, updateHelpRequestStatus } = require('../controllers/helpRequestController');

router.post('/', createHelpRequest);
router.get('/', getHelpRequests);
router.put('/:id', updateHelpRequestStatus);

module.exports = router;
