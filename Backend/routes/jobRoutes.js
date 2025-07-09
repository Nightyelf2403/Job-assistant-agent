const express = require('express');
const router = express.Router();

const { getRemoteJobs, saveJob } = require('../Controllers/jobController');

router.get('/jobs/suggested/:id', getRemoteJobs);  // ✅ FIXED PATH
router.post('/save/:id', saveJob);
module.exports = router;