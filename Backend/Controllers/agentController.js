const axios = require('axios');

// POST /api/generate/answer
const generateAnswer = async (req, res) => {
  const { question, profile, jobDescription } = req.body;

  const prompt = `
You are an AI job application assistant. Given the user's profile and the job description, generate a personalized answer to the question below.

User Profile:
${profile}

Job Description:
${jobDescription}

Question:
${question}

Answer:
`;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt,
      stream: false,
    });

    res.json({ answer: response.data.response });
  } catch (err) {
    console.error('Ollama error:', err.message);
    res.status(500).json({ error: 'Failed to generate answer from Ollama' });
  }
};

// POST /api/resume/analyze
const analyzeResume = async (req, res) => {
  const { resume, jobDescription } = req.body;

  // Mock logic for now
  const score = Math.floor(Math.random() * 21) + 80; // 80-100
  const suggestions = [
    'Include more action verbs related to leadership.',
    'Mention specific tools listed in the job description.',
    'Highlight measurable achievements from past roles.',
  ];

  res.json({
    matchScore: score,
    feedback: suggestions,
  });
};

module.exports = {
  generateAnswer,
  analyzeResume,
};

