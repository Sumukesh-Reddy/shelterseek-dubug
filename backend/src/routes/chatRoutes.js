const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

// Room management
router.post('/room', roleMiddleware.authenticated, chatController.getOrCreateRoom);
router.get('/rooms', roleMiddleware.authenticated, chatController.getUserRooms);
router.delete('/room/:roomId', roleMiddleware.authenticated, chatController.deleteRoom);

// Messages
router.get('/messages/:roomId', roleMiddleware.authenticated, chatController.getMessages);

// User search
router.get('/users/search', roleMiddleware.authenticated, chatController.searchUsers);

// Test endpoint
router.post('/test-message', roleMiddleware.authenticated, chatController.sendTestMessage);

module.exports = router;