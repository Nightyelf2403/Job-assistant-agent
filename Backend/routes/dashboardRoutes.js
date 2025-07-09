const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');

// Fetch dashboard data (applications + suggestions)
router.get('/dashboard/:userId', getDashboardData);

module.exports = router;