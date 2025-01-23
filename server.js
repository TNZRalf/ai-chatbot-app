const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/auth.routes');
const chatRoutes = require('./src/routes/chat.routes');
const { initializeDatabase } = require('./src/config/database');
const { initializeUserModel } = require('./src/models/User');
const { initializeSessionModel } = require('./src/models/Session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Database sync and server start
const startServer = async () => {
  try {
    // Initialize database and models
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Initializing models...');
    await Promise.all([
      initializeUserModel(),
      initializeSessionModel()
    ]);
    
    // Start server
    console.log('Starting server...');
    const availablePort = await findAvailablePort(PORT);
    app.listen(availablePort, () => {
      console.log(`Server running on port ${availablePort}`);
      if (availablePort !== PORT) {
        console.log(`Note: Server is using port ${availablePort} instead of ${PORT}`);
        console.log(`Please update your client's REACT_APP_SERVER_URL to use port ${availablePort}`);
      }
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
