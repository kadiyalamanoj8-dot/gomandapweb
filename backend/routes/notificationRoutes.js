const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/vapidPublicKey', notificationController.getPublicKey);
router.post('/subscribe', notificationController.subscribe);
router.post('/test', notificationController.testNotification);

module.exports = router;
