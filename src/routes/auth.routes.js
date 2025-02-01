const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { User } = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('User found:', user.firstName);

    // Compare password using bcrypt directly
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', user.firstName);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    console.log('JWT token generated successfully');

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return user data (excluding password)
    const { password: _, ...userData } = user.toJSON();
    console.log('Login successful for user:', user.firstName);
    res.json({ user: userData });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return user data (excluding password)
    const { password: _, ...userData } = user.toJSON();
    res.json({ user: userData });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check email availability
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const existingUser = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email // Case-insensitive comparison
        }
      }
    });
    
    res.json({ available: !existingUser });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile update route
router.put('/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update basic info
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.email) user.email = req.body.email;

    // Update password if provided
    if (req.body.currentPassword && req.body.newPassword) {
      const isValidPassword = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      user.password = req.body.newPassword;
    }

    // Update avatar if provided
    if (req.file) {
      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldAvatarPath = path.join(__dirname, '../../', user.avatarUrl);
        try {
          await fs.unlink(oldAvatarPath);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }
      // Set new avatar URL
      user.avatarUrl = '/uploads/avatars/' + req.file.filename;
    }

    await user.save();

    // Return updated user data (excluding password)
    const { password: _, ...userData } = user.toJSON();
    res.json({ user: userData });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user route
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user.toJSON();
    res.json({ user: userData });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
