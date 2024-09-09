const express = require('express');
const { createAnalyst, listUsers } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getDashboardMetrics } = require('../controllers/dashboardController'); // Import the new controller function
const router = express.Router();

// Route for creating analysts
router.post('/create-analyst', authenticate, authorize('Admin'), createAnalyst);

// Route for listing users
router.get('/users', authenticate, authorize('Admin'), listUsers);

// Route for dashboard metrics
router.get('/dashboard',   getDashboardMetrics); // New route for dashboard metrics

module.exports = router;
