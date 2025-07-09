const express = require('express');
const upload = require('../middleware/upload');
const {
  generateAnswer,
  analyzeResume,
  submitFeedback
} = require('../controllers/agentController');

const router = express.Router();

// AI Agent Endpoints
router.post('/generate/answer', generateAnswer);
router.post('/resume/analyze', upload.single('resume'), analyzeResume);
router.post('/feedback', submitFeedback); // Optional feedback

module.exports = router;