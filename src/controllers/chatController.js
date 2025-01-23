const { OpenAI } = require('openai');
const { User } = require('../models/User');

// Initialize OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

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

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          ...history
        ],
        max_tokens: 150
      });

      const aiResponse = completion.choices[0].message.content;

      // Add AI's response to history
      history.push({ role: 'assistant', content: aiResponse });

      // Keep only last 10 messages to manage memory
      if (history.length > 10) {
        chatHistories.set(userId, history.slice(-10));
      }

      res.json({
        success: true,
        message: aiResponse
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get AI response'
      });
    }
  },

  // Get chat history for a user
  async getChatHistory(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const history = chatHistories.get(userId) || [];

      res.json({
        success: true,
        history
      });

    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat history'
      });
    }
  },

  // Clear chat history for a user
  async clearHistory(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      chatHistories.delete(userId);

      res.json({
        success: true,
        message: 'Chat history cleared'
      });

    } catch (error) {
      console.error('Clear history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear chat history'
      });
    }
  }
};

module.exports = chatController;
