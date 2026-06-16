const express = require('express');
const router = express.Router();
const { authAdmin, setup2FA, verify2FA, authGoogle, getUsers, updateUserLocation } = require('../controllers/authController');

router.post('/admin/login', authAdmin);
router.post('/admin/2fa/setup', setup2FA); // In production, add auth middleware
router.post('/admin/2fa/verify', verify2FA); // In production, add auth middleware
router.post('/google', authGoogle);
router.get('/users', getUsers); // Todo: Protect this route later with admin middleware
router.patch('/user/location', updateUserLocation);

module.exports = router;
