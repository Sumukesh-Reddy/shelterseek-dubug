// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes - NO AUTHENTICATION REQUIRED
router.get('/counts', userController.getUserCounts);
router.get('/new-customers', userController.getNewCustomers);  
router.get('/hosts', userController.getHosts);
router.get('/:email', userController.getUserByEmail);

// Protected routes - Admin only
router.get('/', authenticateToken, roleMiddleware.adminOnly, userController.getAllUsers);
router.post('/traveler/liked-rooms', 
  authenticateToken, 
  roleMiddleware.travelerOnly, 
  userController.toggleLikedRoom
);

router.get('/traveler/liked-rooms', 
  authenticateToken, 
  roleMiddleware.travelerOnly, 
  userController.getLikedRooms
);

// Viewed rooms
router.post('/traveler/viewed-rooms', 
  authenticateToken, 
  roleMiddleware.travelerOnly, 
  userController.addViewedRoom
);

router.get('/traveler/viewed-rooms', 
  authenticateToken, 
  roleMiddleware.travelerOnly, 
  userController.getViewedRooms
);

// Clear history
router.post('/traveler/clear-history', 
  authenticateToken, 
  roleMiddleware.travelerOnly, 
  userController.clearHistory
);

// Profile update
router.patch('/profile', 
  authenticateToken, 
  upload.single('profilePhoto'),
  userController.updateProfile
);

module.exports = router;