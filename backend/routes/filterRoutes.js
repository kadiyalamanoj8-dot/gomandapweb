const express = require('express');
const router = express.Router();
const { getFilters, upsertFilterSchema } = require('../controllers/filterController');

router.get('/', getFilters);
router.post('/', upsertFilterSchema);

module.exports = router;
