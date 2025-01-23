const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Function to execute SQL file
const executeSqlFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const command = `psql -U ${process.env.DB_USER} -f "${filePath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing SQL file:', error);
        reject(error);
        return;
      }
      console.log('SQL Output:', stdout);
      if (stderr) console.error('SQL Errors:', stderr);
      resolve();
    });
  });
};

// Initialize database
const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Execute initialization SQL file
    const sqlFilePath = path.join(__dirname, 'init.sql');
    await executeSqlFile(sqlFilePath);
    console.log('Database initialized with tables and schemas.');

    // Sync Sequelize models
    await sequelize.sync({ alter: true });
    console.log('Sequelize models synchronized.');

    return sequelize;
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initializeDatabase
};
