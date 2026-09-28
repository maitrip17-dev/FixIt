import api from './axios.js';

/**
 * Fetch complaints with optional filters (status, category)
 * @param {Object} params - { status, category }
 */
export const getComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

/**
 * Fetch a single complaint by MongoDB ID
 * @param {string} id
 */
export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

/**
 * File a new complaint
 * @param {Object} data - { title, description, category, location, priority }
 */
export const createComplaint = async (data) => {
  const response = await api.post('/complaints', data);
  return response.data;
};

/**
 * Assign a complaint to a worker (Admin only)
 * @param {string} id - Complaint ID
 * @param {string} workerId - User ID of the worker
 */
export const assignComplaint = async (id, workerId) => {
  const response = await api.patch(`/complaints/${id}/assign`, { workerId });
  return response.data;
};

/**
 * Update complaint status (Worker or Admin)
 * @param {string} id - Complaint ID
 * @param {string} status - 'In Progress' | 'Resolved' | 'Closed'
 */
export const updateComplaintStatus = async (id, status) => {
  const response = await api.patch(`/complaints/${id}/status`, { status });
  return response.data;
};

/**
 * Get all available workers for assignment (Admin only)
 */
export const getWorkers = async () => {
  const response = await api.get('/users/workers');
  return response.data;
};

/**
 * Fetch available unassigned complaints pool (Worker/Admin)
 * @param {Object} params - { category, priority }
 */
export const getComplaintsPool = async (params = {}) => {
  const response = await api.get('/complaints/pool', { params });
  return response.data;
};

/**
 * Worker claims an open complaint from the pool
 * @param {string} id - Complaint ID
 */
export const claimComplaint = async (id) => {
  const response = await api.patch(`/complaints/${id}/claim`);
  return response.data;
};

/**
 * Admin returns an active or stalled complaint back to the pool
 * @param {string} id - Complaint ID
 */
export const resetComplaint = async (id) => {
  const response = await api.patch(`/complaints/${id}/reset`);
  return response.data;
};

