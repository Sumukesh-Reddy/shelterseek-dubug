// routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateToken, roleMiddleware.adminOnly);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/recent-activities', adminController.getRecentActivities);
router.get('/trends', adminController.getTrends);  // Add this

// Logs
router.get('/error-logs', adminController.getErrorLogs);

// User management
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;