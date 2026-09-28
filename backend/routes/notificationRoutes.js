const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes are protected
router.use(protect);

// GET /api/notifications - List current user's notifications + unreadCount
router.get('/', getNotifications);

// PATCH /api/notifications/read-all - Mark all unread as read (mount before /:id)
router.patch('/read-all', markAllNotificationsRead);

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', markNotificationRead);

module.exports = router;
