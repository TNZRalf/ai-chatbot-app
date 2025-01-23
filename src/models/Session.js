const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./User');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true
});

// Establish relationship with User model
Session.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Session, { foreignKey: 'userId' });

// Initialize Session model and create table if it doesn't exist
const initializeSessionModel = async () => {
  try {
    await Session.sync();
    console.log('Session model synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing Session model:', error);
    throw error;
  }
};

module.exports = {
  Session,
  initializeSessionModel
};
