// routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken, roleMiddleware.adminOnly);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/recent-activities', adminController.getRecentActivities);
router.get('/trends', adminController.getTrends); 
router.get('/new-customers', userController.getNewCustomers);
router.get('/revenue', bookingController.getRevenueStats);

// Logs
router.get('/error-logs', adminController.getErrorLogs);

// User management
router.delete('/users/:id', adminController.deleteUser);
// Manager management
router.post('/managers', adminController.registerManager);

module.exports = router;