const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

/**
 * @swagger
 * tags:
 *   name: Finance
 *   description: Finance & Revenue API
 */

/**
 * @swagger
 * /api/finance/users:
 *   get:
 *     summary: Get users revenue
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Users revenue data
 */
router.get("/users", financeController.getUsersRevenue);

/**
 * @swagger
 * /api/finance/user/{id}:
 *   get:
 *     summary: Get single user finance
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User finance details
 */
router.get("/user/:id", financeController.getSingleUserFinance);

/**
 * @swagger
 * /api/finance/stats:
 *   get:
 *     summary: Get overall finance stats
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Finance statistics
 */
router.get("/stats", financeController.getFinanceStats);

/**
 * @swagger
 * /api/finance/dashboard:
 *   get:
 *     summary: Get finance dashboard details
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Dashboard details
 */
router.get("/dashboard", financeController.getFinanceDashboard);

/**
 * @swagger
 * /api/finance/hosts:
 *   get:
 *     summary: Get all hosts revenue
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Hosts revenue data
 */
router.get("/hosts", financeController.getHostsRevenue);

/**
 * @swagger
 * /api/finance/host/{email}:
 *   get:
 *     summary: Get single host revenue by email
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Host revenue data
 */
router.get("/host/:email", financeController.getSingleHostRevenue);

/**
 * @swagger
 * /api/finance/host/{email}/details:
 *   get:
 *     summary: Get host details
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Host details
 */
router.get("/host/:email/details", financeController.getHostDetails);

/**
 * @swagger
 * /api/finance/host/{email}/trends:
 *   get:
 *     summary: Get host performance trends
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Performance trends
 */
router.get("/host/:email/trends", financeController.getHostPerformanceTrends);

/**
 * @swagger
 * /api/finance/host/{email}/rooms:
 *   get:
 *     summary: Get host room performance
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rooms performance data
 */
router.get("/host/:email/rooms", financeController.getHostRoomPerformance);
module.exports = router;