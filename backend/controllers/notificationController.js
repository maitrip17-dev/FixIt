const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const connectDB = require('../config/db');

/**
 * Check if MongoDB is connected
 */
const ensureDBConnected = async () => {
  if (mongoose.connection.readyState === 1) return true;
  await connectDB();
  return mongoose.connection.readyState === 1;
};

/**
 * @desc    Get current user's notifications (newest first, limit 20) with unreadCount
 * @route   GET /api/notifications
 * @access  Private (All authenticated roles)
 */
const getNotifications = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const userId = req.user._id;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .populate('sender', 'name email role')
        .populate('complaintId', 'ticketId title status category')
        .sort({ createdAt: -1 })
        .limit(20),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return res.status(200).json({
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Get Notifications Error:', error.message);
    return res.status(500).json({
      message: 'Server error retrieving notifications',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    return res.status(500).json({
      message: 'Server error updating notification',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all unread notifications as read for current user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsRead = async (req, res) => {
  try {
    const connected = await ensureDBConnected();
    if (!connected) {
      return res.status(503).json({
        message: 'Database is not connected. Please ensure MongoDB is running or check your MONGO_URI in backend/.env',
      });
    }

    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error.message);
    return res.status(500).json({
      message: 'Server error marking notifications read',
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
