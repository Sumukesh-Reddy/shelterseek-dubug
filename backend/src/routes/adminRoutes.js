// routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management API
 */

router.use(authenticateToken, roleMiddleware.adminOnly);

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/recent-activities:
 *   get:
 *     summary: Get recent activities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activities list
 */
router.get('/recent-activities', adminController.getRecentActivities);

/**
 * @swagger
 * /api/admin/trends:
 *   get:
 *     summary: Get trend analysis
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trend data
 */
router.get('/trends', adminController.getTrends); 

/**
 * @swagger
 * /api/admin/new-customers:
 *   get:
 *     summary: Get new customers for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of new customers
 */
router.get('/new-customers', userController.getNewCustomers);

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Get revenue stats for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue statistics
 */
router.get('/revenue', bookingController.getRevenueStats);

/**
 * @swagger
 * /api/admin/error-logs:
 *   get:
 *     summary: Get error logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Error logs
 */
// Logs
router.get('/error-logs', adminController.getErrorLogs);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
// User management
router.delete('/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/managers:
 *   post:
 *     summary: Register a new manager
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               aadhaar:
 *                 type: string
 *               pan:
 *                 type: string
 *               department:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               password:
 *                 type: string
 *             example:
 *               name: "Alice Smith"
 *               email: "alice@example.com"
 *               phone: "9876543210"
 *               dob: "1995-05-15"
 *               gender: "Female"
 *               aadhaar: "123456789012"
 *               pan: "ABCDE1234F"
 *               department: "Listings"
 *               joiningDate: "2026-03-29"
 *               password: "AlicePass123!"
 *     responses:
 *       201:
 *         description: Manager registered
 */
// Manager management
router.post('/managers', adminController.registerManager);

module.exports = router;