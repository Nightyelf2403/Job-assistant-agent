const express = require('express');
const router = express.Router();

const { getRemoteJobs, saveJob, applyViaAutofill } = require('../Controllers/jobController');

router.get('/jobs/suggested/:id', getRemoteJobs); 
router.post('/save/:id', saveJob);

router.post("/apply/autofill", applyViaAutofill);
module.exports = router;




