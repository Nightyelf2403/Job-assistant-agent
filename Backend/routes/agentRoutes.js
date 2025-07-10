const express = require('express');
const upload = require('../middleware/upload');
const {
  generateAnswer,
  analyzeResume,
  submitFeedback,
  generateRecruiterAnswers,
  scoreResumeAgainstJD,
  
} = require('../controllers/agentController');

const router = express.Router();

// AI Agent Endpoints
router.post('/generate/answer', generateAnswer);
router.post('/resume/analyze', upload.single('resume'), analyzeResume);
router.post('/feedback', submitFeedback); // Optional feedback
router.post('/generate/recruiter-answers', generateRecruiterAnswers);
router.post('/score', scoreResumeAgainstJD);



module.exports = router;