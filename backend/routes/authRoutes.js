const express = require('express');
const router = express.Router();
const { authAdmin, syncUser, authGoogle, getUsers } = require('../controllers/authController');

router.post('/admin/login', authAdmin);
router.post('/user/sync', syncUser);
router.post('/google', authGoogle);
router.get('/users', getUsers); // Todo: Protect this route later with admin middleware

module.exports = router;
