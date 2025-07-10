const axios = require('axios');
const pdfParse = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.generateAnswer = async (req, res) => {
  const { jobDescription, userProfile } = req.body;
  if (!jobDescription || !userProfile) {
    return res.status(400).json({ error: 'Missing job description or user profile' });
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that writes personalized answers to job application questions.'
    },
    {
      role: 'user',
      content: `
Job Description:
${jobDescription}

User Profile:
${JSON.stringify(userProfile)}

Generate a short, professional answer to: "Why are you a good fit for this role?"

Respond ONLY in this JSON format:
{
  "answer": "<your generated answer>"
}`
    }
  ];

  try {
    const response = await axios.post(
      'https://adihub3504002192.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview',
      {
        messages,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_API_KEY
        }
      }
    );

    const message = response.data.choices[0]?.message?.content;
    let json;
    try {
      json = JSON.parse(message);
    } catch (parseErr) {
      console.error('JSON parse error in generateAnswer:', parseErr);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
    res.json(json);
  } catch (err) {
    console.error('Answer generation error:', err);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
};

exports.analyzeResume = async (req, res) => {
  const { jobDescription } = req.body;
  const file = req.file;
  if (!file || !jobDescription) {
    return res.status(400).json({ error: 'Missing resume file or job description' });
  }

  try {
    const data = await pdfParse(file.buffer);
    const resumeText = data.text.slice(0, 9000); // limit to 9000 characters explicitly
    const messages = [
      {
        role: 'system',
        content: 'You are a resume scoring assistant.'
      },
      {
        role: 'user',
        content: `
Given the resume and job description below, provide:
1. A match score from 0–100
2. 3 short insights on how to improve

Respond ONLY in this JSON format:
{
  "matchScore": <number>,
  "insights": ["...", "...", "..."]
}

Resume:
${resumeText}

Job Description:
${jobDescription}`
      }
    ];

    const response = await axios.post(
      'https://adihub3504002192.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview',
      {
        messages,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_API_KEY
        }
      }
    );

    const message = response.data.choices[0]?.message?.content;
    let json;
    try {
      json = JSON.parse(message);
    } catch (parseErr) {
      console.error('JSON parse error in analyzeResume:', parseErr);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
    // Save resumeText to user's profile if user ID is present
    const userId = req.user?.id || req.body.userId;
    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { resumeText }
        });
      } catch (saveErr) {
        console.error("Failed to save extracted resume text to user:", saveErr);
      }
    }
    res.json({ ...json, resumeText });
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};

exports.submitFeedback = async (req, res) => {
  const { answerId, rating, comment } = req.body;
  if (!answerId || typeof rating !== 'number' || ![0, 1].includes(rating)) {
    return res.status(400).json({ error: 'Invalid feedback format' });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: { answerId, rating, comment }
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to store feedback' });
  }
};
exports.generateRecruiterAnswers = async (req, res) => {
  const { jobId, userId, questions } = req.body;

  if (!jobId || !userId || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Missing jobId, userId, or questions' });
  }

  const job = await prisma.savedJob.findFirst({
    where: { id: jobId },
    select: { description: true }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  const jobDescription = job?.description || '';
  const userProfile = user || {};

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that answers recruiter questions using a candidate profile and job description.'
    },
    {
      role: 'user',
      content: `
Job Description:
${jobDescription}

User Profile:
${JSON.stringify(userProfile)}

Questions:
${JSON.stringify(questions)}

Respond ONLY in this JSON format:
{
  "answers": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
}`
    }
  ];

  try {
    const response = await axios.post(
      'https://adihub3504002192.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview',
      {
        messages,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_API_KEY
        }
      }
    );

    const message = response.data.choices[0]?.message?.content;
    let json;
    try {
      json = JSON.parse(message);
    } catch (parseErr) {
      console.error('JSON parse error in generateRecruiterAnswers:', parseErr);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
    res.json(json);
  } catch (err) {
    console.error('Recruiter answers generation error:', err);
    res.status(500).json({ error: 'Failed to generate recruiter answers' });
  }
};

exports.scoreResumeAgainstJD = async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: 'Missing resume text or job description' });
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that evaluates resume match with job descriptions.'
    },
    {
      role: 'user',
      content: `
Resume:
${resumeText}

Job Description:
${jobDescription}

Give a match score out of 100 and a few reasons. Respond in this JSON format:
{
  "score": <number>,
  "points": ["reason 1", "reason 2", "reason 3"]
}`
    }
  ];

  try {
    const response = await axios.post(
      'https://adihub3504002192.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview',
      {
        messages,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_API_KEY
        }
      }
    );

    const message = response.data.choices[0]?.message?.content;
    let json;
    try {
      json = JSON.parse(message);
    } catch (parseErr) {
      console.error('JSON parse error in scoreResumeAgainstJD:', parseErr);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
    res.json(json);
  } catch (err) {
    console.error('Error scoring resume against JD:', err);
    res.status(500).json({ error: 'Failed to score resume' });
  }
};