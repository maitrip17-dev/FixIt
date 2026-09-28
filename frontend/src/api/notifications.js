import api from './axios.js';

/**
 * Fetch notifications for current user
 */
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Mark a single notification as read
 * @param {string} id - Notification ID
 */
export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
