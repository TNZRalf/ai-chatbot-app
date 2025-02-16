const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const helmet = require('helmet');
const cvRoutes = require('./routes/cvRoutes');
const userService = require('./services/userService');
const { auth, authLimiter } = require('./middleware/auth');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

// Initialize Firebase Admin with strict configuration
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseAuthVariableOverride: null
});

// Initialize PostgreSQL with SSL if in production
const db = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for development
}));
app.disable('x-powered-by'); // Hide Express

// CORS configuration with strict options
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    maxAge: 600 // Cache preflight requests for 10 minutes
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Middleware for parsing request bodies
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Logging middleware with sanitization
app.use((req, res, next) => {
    const sanitizedUrl = req.url.replace(/[<>]/g, '');
    console.log(`${new Date().toISOString()} - ${req.method} ${sanitizedUrl}`);
    next();
});

// Apply rate limiting to all routes
app.use(authLimiter);

// Health check endpoint (public)
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// CV routes
app.use('/cv', cvRoutes);

// User authentication routes
app.post('/auth/register', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await userService.createUser(email, password);
        res.status(201).json({ uid: userRecord.uid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ error: error.message });
    }
});

app.post('/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await userService.loginUser(email, password);
        res.json({ uid: userRecord.uid });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: error.message });
    }
});

// Protected routes
app.use('/api', auth, (req, res, next) => {
    // All routes under /api require authentication
    next();
});

// Protected routes
app.use('/api/cv', cvRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Clean up any uploaded files if there's an error
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkError) => {
            if (unlinkError) {
                console.error('Error deleting failed upload:', unlinkError);
            }
        });
    }
    
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error'
        : err.message;
    
    res.status(err.status || 500).json({
        error: message,
        details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3001;

// Initialize Firebase service after Firebase Admin is initialized
const firebaseService = require('./services/firebaseService');

// Initialize user sync listener
firebaseService.initUserSyncListener().catch(console.error);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('CORS enabled for origin:', corsOptions.origin);
    console.log('File upload directory:', uploadsDir);
});
