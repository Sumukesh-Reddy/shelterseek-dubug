// routes/managerRoutes.js
const express = require('express');
const managerController = require('../controllers/managerController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', managerController.managerLogin);
router.get('/by-email/:email', managerController.getManagerByEmail);

// Protected routes (require authentication)
router.use(authenticateToken);

// Manager only routes
router.get('/dashboard/stats', roleMiddleware.managerOnly, managerController.getDashboardStats);
router.patch('/profile', roleMiddleware.managerOnly, managerController.updateManagerProfile);

// Admin only routes
router.get('/all', roleMiddleware.adminOnly, managerController.getAllManagers);

module.exports = router;