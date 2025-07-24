const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../Controllers/dashboardController');

// Fetch dashboard data (applications + suggestions)
router.get('/dashboard/:userId', getDashboardData);

module.exports = router;