// routes/managerRoutes.js
const express = require('express');
const managerController = require('../controllers/managerController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Managers
 *   description: Manager dashboard and operations API
 */

/**
 * @swagger
 * /api/managers/login:
 *   post:
 *     summary: Manager login
 *     tags: [Managers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "alice@example.com"
 *               password: "AlicePass123!"
 *     responses:
 *       200:
 *         description: Manager logged in
 */
// Public routes
router.post('/login', managerController.managerLogin);

/**
 * @swagger
 * /api/managers/by-email/{email}:
 *   get:
 *     summary: Get manager by email
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager details
 */
router.get('/by-email/:email', managerController.getManagerByEmail);

// Protected routes (require authentication)
router.use(authenticateToken);

/**
 * @swagger
 * /api/managers/dashboard/stats:
 *   get:
 *     summary: Get manager dashboard statistics
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
// Manager only routes
router.get('/dashboard/stats', roleMiddleware.managerOnly, managerController.getDashboardStats);

/**
 * @swagger
 * /api/managers/profile:
 *   get:
 *     summary: Get manager profile
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get('/profile', roleMiddleware.managerOnly, managerController.getManagerProfile);

/**
 * @swagger
 * /api/managers/profile:
 *   patch:
 *     summary: Update manager profile
 *     tags: [Managers]
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
 *               phone:
 *                 type: string
 *             example:
 *               name: "Alice Updated"
 *               phone: "9876543211"
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', roleMiddleware.managerOnly, managerController.updateManagerProfile);

/**
 * @swagger
 * /api/managers/change-password:
 *   patch:
 *     summary: Change manager password
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             example:
 *               currentPassword: "OldPassword123!"
 *               newPassword: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password successfully changed
 */
router.patch('/change-password', roleMiddleware.managerOnly, managerController.changeManagerPassword);

/**
 * @swagger
 * /api/managers/listings:
 *   get:
 *     summary: Get listings for manager dashboard
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listings dashboard data
 */
router.get(
  '/listings',
  roleMiddleware.managerOnly,
  managerController.getListingsDashboard
);

/**
 * @swagger
 * /api/managers/listings/{listingId}/status:
 *   patch:
 *     summary: Update managed listing status
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *             example:
 *               status: "approved"
 *     responses:
 *       200:
 *         description: Listing status updated
 */
router.patch(
  '/listings/:listingId/status',
  roleMiddleware.managerOnly,
  managerController.updateManagedListingStatus
);

/**
 * @swagger
 * /api/managers/listings/{id}:
 *   delete:
 *     summary: Delete a managed listing
 *     tags: [Managers]
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
 *         description: Listing deleted
 */
router.delete(
  '/listings/:id',
  roleMiddleware.managerOnly,
  managerController.deleteManagedListing
);

/**
 * @swagger
 * /api/managers/all:
 *   get:
 *     summary: Get all managers
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all managers
 */
// Admin only routes
router.get('/all', roleMiddleware.adminOnly, managerController.getAllManagers);

module.exports = router;
