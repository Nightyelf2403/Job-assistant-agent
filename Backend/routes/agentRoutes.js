
const express = require('express');
const router = express.Router();
const { generateAnswer, analyzeResume } = require('../Controllers/agentController');

// POST /api/generate/answer
router.post('/generate/answer', generateAnswer);

// POST /api/resume/analyze
router.post('/resume/analyze', analyzeResume);

module.exports = router;
