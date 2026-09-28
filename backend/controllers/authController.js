const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

/**
 * Check if MongoDB is connected, and try to connect if disconnected
 */
const ensureDBConnected = async () => {
  if (mongoose.connection.readyState === 1) return true;
  await connectDB();
  return mongoose.connection.readyState === 1;
};

/**
 * Generate a JWT signed token with 1-day expiration
 * Payload contains user ID and role
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    // Proactively verify database connection state
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or update MONGO_URI in backend/.env',
      });
    }

    const { name, email, password, role, skillCategory } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email',
      });
    }

    // Validate role if specified
    const validRoles = ['user', 'worker', 'admin'];
    const assignedRole = role && validRoles.includes(role) ? role : 'user';

    const validCategories = ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Other'];
    const assignedSkill = skillCategory && validCategories.includes(skillCategory) ? skillCategory : 'Other';

    // Hash password with bcryptjs (salt factor: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      skillCategory: assignedRole === 'worker' ? assignedSkill : 'Other',
    });

    // Generate JWT token
    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skillCategory: user.skillCategory,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    // Proactively verify database connection state
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or update MONGO_URI in backend/.env',
      });
    }

    const { email, password } = req.body;

    // Validate input presence
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide both email and password',
      });
    }

    // Find user by lowercase trimmed email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({
        message: 'No Registered User',
      });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skillCategory: user.skillCategory || 'Other',
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private (requires protect middleware)
 */
const getMe = async (req, res) => {
  try {
    // req.user is attached by protect middleware without password
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        skillCategory: req.user.skillCategory || 'Other',
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    return res.status(500).json({
      message: 'Server error retrieving user profile',
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  generateToken,
};
