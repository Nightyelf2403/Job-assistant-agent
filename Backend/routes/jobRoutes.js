const express = require('express');
const router = express.Router();

const { getRemoteJobs, saveJob, applyViaAutofill, getJobDetails, getSuggestedJobById, saveSuggestedJob } = require('../Controllers/jobController');
const { authenticateToken } = require('../middleware/authMiddleware');
const jobController = require('../Controllers/jobController');

router.get('/jobs/suggested/:id', getRemoteJobs); 
router.get('/jobs/details/:id', getJobDetails);
router.post('/save/:id', saveJob);
router.get('/jobs/suggested-job/:id', getSuggestedJobById); 
router.post('/suggested-jobs', authenticateToken, saveSuggestedJob);


router.post("/apply/autofill", applyViaAutofill);
module.exports = router;
