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
${data.text}

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
    res.json(json);
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