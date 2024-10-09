const express = require('express');
const { createUser, listUsers } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.post('/create-User', createUser);  // Only Admins can create Analysts
router.get('/users', authenticate, authorize('Admin'), listUsers);  // Only Admins can list users

// Analyst routes
// router.post('/create-analyst', authenticate, authorize('Admin'), createUser);
// router.delete('/delete-analyst/:id', authenticate, authorize('Admin'), deleteUser);
// router.put('/update-analyst/:id', authenticate, authorize('Admin'), updateUser);
// router.get('/analyst/:id', authenticate, authorize('Admin'), getUserById);


module.exports = router;
