const express = require('express');
const aiChatController = require('../controllers/aiChatController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI Chatbot API
 */

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *             example:
   *               message: "What are the rules of this shelter?"
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: AI response
 */
// AI chat endpoint
router.post('/chat', aiChatController.chat);

module.exports = router;