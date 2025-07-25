const express = require('express');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/authMiddleware');

const {
  generateAnswer,
  analyzeResume,
  submitFeedback,
  generateRecruiterAnswers,
  scoreResumeAgainstJD,
  askAIQuestion,
  startAutofillApplication,
} = require('../Controllers/agentController');

const router = express.Router();

// AI Agent Endpoints
router.post('/generate/answer', generateAnswer);
router.post('/resume/analyze', upload.single('resume'), analyzeResume);
router.post('/feedback', submitFeedback); // Optional feedback
router.post('/generate/recruiter-answers', generateRecruiterAnswers);
router.post('/generate/score', authenticateToken, scoreResumeAgainstJD);
router.post('/generate/ask', authenticateToken, askAIQuestion);
router.post('/autofill-start', startAutofillApplication);
router.post("/generate/autofill-answers", agentController.generateAutofillAnswers);
console.log('✅ /api/generate/score route loaded');
console.log('✅ /api/generate/ask route loaded');





module.exports = router;
