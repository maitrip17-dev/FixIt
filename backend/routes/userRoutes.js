const express = require('express');
const router = express.Router();
const { getWorkers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// All user routes require authentication
router.use(protect);

// Workers list for assignment dropdown (admin only)
router.get('/workers', authorizeRoles('admin'), getWorkers);

module.exports = router;
