const express = require('express');
const { registerUser, authUser, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/change-password', protect, changePassword);

module.exports = router;
