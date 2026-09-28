const User = require('../models/User');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const ensureDBConnected = async () => {
  if (mongoose.connection.readyState === 1) return true;
  await connectDB();
  return mongoose.connection.readyState === 1;
};

/**
 * @desc    Get all registered workers (for admin assignment dropdown)
 * @route   GET /api/users/workers
 * @access  Private (Admin only)
 */
const getWorkers = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const workers = await User.find({ role: 'worker' }).select('_id name email role');

    return res.status(200).json({
      count: workers.length,
      workers,
    });
  } catch (error) {
    console.error('Get Workers Error:', error.message);
    return res.status(500).json({
      message: 'Server error retrieving workers',
      error: error.message,
    });
  }
};

module.exports = {
  getWorkers,
};
