const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Route to get overall admin statistics
router.get('/admin-stats', protect, admin, getAdminStats);

module.exports = router;
