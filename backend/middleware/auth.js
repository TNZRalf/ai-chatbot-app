const admin = require('firebase-admin');
const userService = require('../services/userService');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many authentication attempts, please try again later' }
});

// Token validation helper
const validateToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token, true);
        
        // Check token age (max 1 hour)
        const tokenAge = Date.now() - (decodedToken.auth_time * 1000);
        if (tokenAge > 3600000) { // 1 hour in milliseconds
            throw new Error('Token too old, please reauthenticate');
        }
        
        return decodedToken;
    } catch (error) {
        console.error('Token validation error:', error);
        throw error;
    }
};

// Create auth middleware factory
const createAuthMiddleware = (options = {}) => {
    const {
        requireEmailVerification = false, // Make email verification optional
        checkUserDisabled = true,         // Keep disabled check by default
    } = options;

    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ 
                    error: 'No token provided',
                    message: 'Authentication required'
                });
            }

            const token = authHeader.split(' ')[1];
            
            try {
                // Validate the token
                const decodedToken = await validateToken(token);
                
                // Get user from Firebase
                const firebaseUser = await admin.auth().getUser(decodedToken.uid);
                
                // Optional email verification check
                if (requireEmailVerification && !firebaseUser.emailVerified) {
                    return res.status(403).json({ 
                        error: 'Email not verified',
                        message: 'Please verify your email address before proceeding'
                    });
                }

                // Optional disabled check
                if (checkUserDisabled && firebaseUser.disabled) {
                    return res.status(403).json({ 
                        error: 'Account disabled',
                        message: 'Your account has been disabled'
                    });
                }

                // Sync user with database
                await userService.createUser(firebaseUser);
                
                // Get full user data
                const user = await userService.getUserByFirebaseUid(decodedToken.uid);
                
                // Remove sensitive information
                delete user.firebase_uid;
                
                // Attach user to request
                req.user = user;
                
                // Add security headers
                res.set({
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block'
                });
                
                next();
            } catch (error) {
                console.error('Auth error:', error);
                return res.status(401).json({ 
                    error: 'Invalid token',
                    message: 'Please log in again'
                });
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ 
                error: 'Internal server error',
                message: 'An unexpected error occurred'
            });
        }
    };
};

// Create default auth middleware
const auth = createAuthMiddleware();

// Create auth middleware that doesn't require email verification
const authNoEmailVerification = createAuthMiddleware({ requireEmailVerification: false });

module.exports = { 
    auth,                    // Default auth with email verification
    authNoEmailVerification, // Auth without email verification
    authLimiter,            // Rate limiter
    createAuthMiddleware    // Factory function for custom auth middleware
};
