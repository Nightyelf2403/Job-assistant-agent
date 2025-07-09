const axios = require('axios');
const pdfParse = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.generateAnswer = async (req, res) => {
  const { jobDescription, userProfile } = req.body;
  if (!jobDescription || !userProfile) {
    return res.status(400).json({ error: 'Missing job description or user profile' });
  }

  const prompt = `
You are a helpful assistant that writes personalized answers to job application questions.

Job Description:
${jobDescription}

User Profile:
${JSON.stringify(userProfile)}

Generate a short, professional answer to: "Why are you a good fit for this role?"
Respond ONLY in this JSON format:
{
  "answer": "<your generated answer>"
}
`;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt,
      stream: false
    });

    const json = JSON.parse(response.data.response);
    res.json(json);
  } catch (err) {
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
    const prompt = `
You are a resume scoring assistant.

Given the resume and job description below, provide:
1. A match score from 0–100
2. 3 short insights on how to improve

Respond ONLY in this JSON format:
{
  "matchScore": <number>,
  "insights": ["...", "...", "..."]
}

Resume:
${data.text}

Job Description:
${jobDescription}
`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt,
      stream: false
    });

    const json = JSON.parse(response.data.response);
    res.json(json);
  } catch (err) {
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