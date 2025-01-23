const { User } = require('../models/User');

// Store chat histories in memory (in production, this should be in a database)
const chatHistories = new Map();

const chatController = {
  // Send a message to the AI and get a response
  async sendMessage(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id; // From auth middleware

      // Get or create chat history for this user
      if (!chatHistories.has(userId)) {
        chatHistories.set(userId, []);
      }
      const history = chatHistories.get(userId);

      // Add user's message to history
      history.push({ role: 'user', content: message });

      // Add mock AI response
      const mockResponse = "This is a mock response. OpenAI integration will be added later.";
      history.push({ role: 'assistant', content: mockResponse });

      // Keep only last 10 messages
      if (history.length > 20) {
        history.splice(0, 2); // Remove oldest message pair
      }

      res.json({
        message: mockResponse,
        history: history
      });

    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  },

  // Get chat history for a user
  async getChatHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = chatHistories.get(userId) || [];
      res.json({ history });
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  },

  // Clear chat history for a user
  async clearHistory(req, res) {
    try {
      const userId = req.user.id;
      chatHistories.set(userId, []);
      res.json({ message: 'Chat history cleared' });
    } catch (error) {
      console.error('Error in clearHistory:', error);
      res.status(500).json({ error: 'Failed to clear chat history' });
    }
  }
};

module.exports = chatController;
