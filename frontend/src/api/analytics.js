import api from './axios.js';

/**
 * Fetch system-wide maintenance intelligence and aggregation analytics (Admin only)
 */
export const getAnalyticsOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};
