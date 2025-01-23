const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app123456',
  database: process.env.DB_NAME || 'ai_chatbot_db',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
});

// Function to execute SQL file
async function executeSqlFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    console.log(`Executing SQL file: ${fullPath}`);
    
    const sql = require('fs').readFileSync(fullPath, 'utf8');
    await sequelize.query(sql);
    
    console.log('SQL file executed successfully');
  } catch (error) {
    console.error('Error executing SQL file:', error);
    throw error;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  initializeDatabase
};
