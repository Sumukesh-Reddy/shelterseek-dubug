// routes/bookingRoutes.js
const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public stats routes - NO AUTHENTICATION REQUIRED
router.get('/summary', bookingController.getBookingSummary);
router.get('/summarys', bookingController.getBookingSummary);
router.get('/stats', bookingController.getBookingStats);
router.get('/revenue', bookingController.getRevenueStats);

// Protected routes
router.post('/',
  authenticateToken,
  roleMiddleware.travelerOnly,
  bookingController.createBooking
);

router.get('/history',
  authenticateToken,
  roleMiddleware.travelerOnly,
  bookingController.getTravelerBookings
);

router.get('/host',
  authenticateToken,
  roleMiddleware.hostOnly,
  bookingController.getHostBookings
);

router.get('/analytics/host',
  authenticateToken,
  roleMiddleware.hostOnly,
  bookingController.getHostAnalytics
);

router.get('/traveler/:email',
  authenticateToken,
  roleMiddleware.adminOnly,
  bookingController.getBookingsByTravelerEmail
);

module.exports = router;