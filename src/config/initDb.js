const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app123456',
  database: process.env.DB_NAME || 'ai_chatbot_db',
  logging: console.log
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Define UserSettings model
const UserSettings = sequelize.define('UserSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'light'
  },
  fontSize: {
    type: DataTypes.STRING,
    defaultValue: 'medium'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  }
});

// Define relationships
User.hasOne(UserSettings);
UserSettings.belongsTo(User);

async function initializeDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ force: true }); // Be careful with force: true in production!
    console.log('✅ Database synchronized successfully');

    // Create test user
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$10$zGUXxR3kouGwkQMkQxh0aOzuC/Yq5NjgiBZt.qYnucHIL0cJGpk1O' // password: test123
    });

    // Create settings for test user
    await UserSettings.create({
      userId: testUser.id,
      theme: 'light',
      fontSize: 'medium',
      language: 'en'
    });

    console.log('✅ Test user created successfully');
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: test123');

  } catch (error) {
    console.error('❌ Unable to initialize database:', error);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();
