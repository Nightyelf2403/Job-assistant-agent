const express = require('express');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/authMiddleware');
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
router.post('/generate/score', authenticateToken, scoreResumeAgainstJD);

console.log('✅ /api/generate/score route loaded');





module.exports = router;