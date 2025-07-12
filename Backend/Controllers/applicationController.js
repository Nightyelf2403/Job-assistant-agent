// controllers/applicationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// ✅ Autofill Agent: Submit application using user profile the application
const autofillApplication = async (req, res) => {
  const userId = req.params.userId;
  const { job } = req.body;

  if (!job || !job.title || !job.company || !job.location) {
    return res.status(400).json({ error: 'Job title, company, and location are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newApp = await prisma.application.create({
      data: {
        userId,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        status: 'applied',
        dateApplied: new Date()
      }
    });

    res.status(201).json({ message: 'Application submitted via Autofill', application: newApp });
  } catch (err) {
    console.error('❌ Autofill failed:', err);
    res.status(500).json({ error: 'Failed to autofill application', detail: err.message });
  }
};

// ✅ Autofill Agent: Generate answers to application questions using AI
const axios = require('axios');
const generateAnswerForQuestions = async (req, res) => {
  const { userId } = req.params;
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Questions array is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profileDetails = `
      Name: ${user.name}
      Email: ${user.email}
      Phone: ${user.phone || 'N/A'}
      Current Location: ${user.currentLocation || 'N/A'}
      Preferred Locations: ${(user.preferredLocations || []).join(', ')}
      Job Type: ${user.jobType || 'N/A'}
      Desired Position: ${user.desiredPosition || 'N/A'}
      Desired Salary: ${user.desiredSalary || 'N/A'}
      Work Preference: ${(user.workPreference || []).join(', ')}
      Skills: ${(user.skills || []).join(', ')}
      Languages: ${(user.languages || []).join(', ')}
      Certifications: ${(user.certifications || []).join(', ')}
    `;

    const systemPrompt = {
      role: 'system',
      content: 'You are a helpful AI assistant that generates professional answers to job application questions based on the user’s resume and profile.'
    };

    const userPrompt = {
      role: 'user',
      content: `User profile:\n${profileDetails}\n\nAnswer the following questions in a professional tone:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    };

    const aiRes = await axios.post(
      process.env.AZURE_OPENAI_API_ENDPOINT,
      {
        messages: [systemPrompt, userPrompt],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_API_KEY
        }
      }
    );

    const aiAnswer = aiRes.data?.choices?.[0]?.message?.content || 'No response generated';

    res.json({ answers: aiAnswer.trim() });
  } catch (error) {
    console.error('❌ AI generation failed:', error);
    res.status(500).json({ error: 'Failed to generate answers', detail: error.message });
  }
};

// ✅ AI Application Submission with Email Notification
const aiSubmitApplication = async (req, res) => {
  const {
    jobId, userId, title, company, location,
    description, answers, coverLetter, userProfile
  } = req.body;

  if (!jobId || !userId || !title || !company) {
    return res.status(400).json({ error: 'Missing required job or user fields.' });
  }

  try {
    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        jobTitle: title,
        company,
        location,
        description,
        answers,
        coverLetter,
        status: 'applied',
        dateApplied: new Date()
      }
    });

    console.log("✅ Application saved:", application);

    if (userProfile?.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Job Assistant" <${process.env.EMAIL_USER}>`,
        to: userProfile.email,
        subject: `✅ Application Submitted: About the Job - ${title} at ${company}`,
        html: `
          <p>Hi ${userProfile.name || "there"},</p>
          <p>Your application for <strong>${title}</strong> at <strong>${company}</strong> was submitted using Job Assistant AI.</p>
          <p>We wish you the best of luck! 🚀</p>
        `
      });

      console.log("📧 Email sent to:", userProfile.email);
    }

    res.status(201).json({ message: 'Application submitted with AI', application });
  } catch (err) {
    console.error('❌ AI application submission failed:', err);
    res.status(500).json({ error: 'AI submission failed', detail: err.message });
  }
};

module.exports = {
  autofillApplication,
  generateAnswerForQuestions,
  aiSubmitApplication
};
