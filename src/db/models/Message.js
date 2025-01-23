const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const User = require('./User');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sender: {
    type: DataTypes.ENUM('user', 'ai'),
    allowNull: false
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachmentType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachmentName: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

// Define relationship
Message.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(Message, {
  foreignKey: 'userId'
});

module.exports = Message;
