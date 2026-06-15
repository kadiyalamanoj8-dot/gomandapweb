const express = require('express');
const router = express.Router();
const cartOrderController = require('../controllers/cartOrderController');

router.post('/', cartOrderController.createCartOrder);
router.get('/vendor/:vendorId', cartOrderController.getVendorBookings);
router.put('/:orderId/item/:itemId', cartOrderController.updateVendorItemStatus);

module.exports = router;
