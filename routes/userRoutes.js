const express = require('express');
const { createAnalyst, listUsers } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.post('/create-analyst', authenticate, authorize('Admin'), createAnalyst);  // Only Admins can create Analysts
router.get('/users', authenticate, authorize('Admin'), listUsers);  // Only Admins can list users

module.exports = router;
