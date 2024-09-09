const express = require('express');
const { signup, login, changePassword, forgetPassword } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);  // Requires authentication
router.post('/forget-password', forgetPassword);

module.exports = router;
