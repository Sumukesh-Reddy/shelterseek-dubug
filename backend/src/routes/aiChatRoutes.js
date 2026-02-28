const express = require('express');
const aiChatController = require('../controllers/aiChatController');

const router = express.Router();

// AI chat endpoint
router.post('/chat', aiChatController.chat);

module.exports = router;