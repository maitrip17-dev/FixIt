const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  getComplaintsPool,
  claimComplaint,
  adminResetComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// All complaint routes require authentication
router.use(protect);

// File complaint: user or admin
router.post('/', authorizeRoles('user', 'admin'), createComplaint);

// View complaints: role-scoped list
router.get('/', getComplaints);

// View open pool tickets (Worker only) - MUST be defined before /:id
router.get('/pool', authorizeRoles('worker'), getComplaintsPool);

// View single complaint by ID
router.get('/:id', getComplaintById);

// Worker claims an open ticket
router.patch('/:id/claim', authorizeRoles('worker'), claimComplaint);

// Admin emergency resets a ticket back to pool
router.patch('/:id/reset', authorizeRoles('admin'), adminResetComplaint);

// Assign complaint: admin only
router.patch('/:id/assign', authorizeRoles('admin'), assignComplaint);

// Update status: worker or admin
router.patch('/:id/status', authorizeRoles('worker', 'admin'), updateComplaintStatus);

module.exports = router;
