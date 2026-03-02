const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

router.get("/users", financeController.getUsersRevenue);
router.get("/user/:id", financeController.getSingleUserFinance);
router.get("/stats", financeController.getFinanceStats);
router.get("/dashboard", financeController.getFinanceDashboard);
router.get("/hosts", financeController.getHostsRevenue);
router.get("/host/:email", financeController.getSingleHostRevenue);
router.get("/host/:email/details", financeController.getHostDetails);
router.get("/host/:email/trends", financeController.getHostPerformanceTrends);
router.get("/host/:email/rooms", financeController.getHostRoomPerformance);
module.exports = router;