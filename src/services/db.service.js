const { User, Message } = require('../db/models');

class DatabaseService {
  // User operations
  static async createUser(userData) {
    return await User.create(userData);
  }

  static async getUserById(userId) {
    return await User.findByPk(userId);
  }

  static async getUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  static async updateUser(userId, userData) {
    const user = await User.findByPk(userId);
    if (user) {
      return await user.update(userData);
    }
    return null;
  }

  // Message operations
  static async createMessage(messageData) {
    return await Message.create(messageData);
  }

  static async getMessagesByUser(userId, limit = 50, offset = 0) {
    return await Message.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  static async updateMessage(messageId, messageData) {
    const message = await Message.findByPk(messageId);
    if (message) {
      return await message.update(messageData);
    }
    return null;
  }

  static async deleteMessage(messageId) {
    const message = await Message.findByPk(messageId);
    if (message) {
      await message.destroy();
      return true;
    }
    return false;
  }
}

module.exports = DatabaseService;
