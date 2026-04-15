const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and messaging API
 */

// All chat routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/chat/room:
 *   post:
 *     summary: Get or create a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *             example:
 *               participantId: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Chat room details
 */
// Room management
router.post('/room', roleMiddleware.authenticated, chatController.getOrCreateRoom);

/**
 * @swagger
 * /api/chat/rooms:
 *   get:
 *     summary: Get all chat rooms for current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat rooms
 */
router.get('/rooms', roleMiddleware.authenticated, chatController.getUserRooms);

/**
 * @swagger
 * /api/chat/room/{roomId}:
 *   delete:
 *     summary: Delete a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted
 */
router.delete('/room/:roomId', roleMiddleware.authenticated, chatController.deleteRoom);

/**
 * @swagger
 * /api/chat/messages/{roomId}:
 *   get:
 *     summary: Get messages for a room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
// Messages
router.get('/messages/:roomId', roleMiddleware.authenticated, chatController.getMessages);

/**
 * @swagger
 * /api/chat/users/search:
 *   get:
 *     summary: Search for users to chat with
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: matching users
 */
// User search
router.get('/users/search', roleMiddleware.authenticated, chatController.searchUsers);

/**
 * @swagger
 * /api/chat/test-message:
 *   post:
 *     summary: Send a test message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test message sent
 */
// Test endpoint
router.post('/test-message', roleMiddleware.authenticated, chatController.sendTestMessage);

module.exports = router;