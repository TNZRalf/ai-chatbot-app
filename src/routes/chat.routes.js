const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// All chat routes require authentication
router.use(authenticateToken);

// Send a message to the AI
router.post('/send', chatController.sendMessage);

// Get chat history
router.get('/history', chatController.getChatHistory);

// Clear chat history
router.delete('/history', chatController.clearHistory);

module.exports = router;
