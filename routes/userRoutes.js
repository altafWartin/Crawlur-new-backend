const express = require('express');
const { createUser, listUsers } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.post('/create-User', createUser);  // Only Admins can create Analysts
router.get('/users', authenticate, authorize('Admin'), listUsers);  // Only Admins can list users

module.exports = router;
