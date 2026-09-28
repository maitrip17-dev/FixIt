const express = require('express');
const router = express.Router();
const { getAnalyticsOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// All analytics routes require authentication and admin role
router.use(protect);
router.use(authorizeRoles('admin'));

// GET /api/analytics/overview - System overview, hotspots, category distribution & turnaround efficiency
router.get('/overview', getAnalyticsOverview);

module.exports = router;
