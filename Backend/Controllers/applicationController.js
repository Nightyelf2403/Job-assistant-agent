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
        status: 'in-progress',
        dateApplied: new Date()
      }
    });

    if (user?.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Job Assistant" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📝 Application Started (Not Yet Submitted): ${job.title} at ${job.company}`,
        html: `
          <p>Hi ${user.name || "there"},</p>
          <p>You have started an application using Autofill Agent. Don't forget to review and submit it!</p>
          <h3>🧾 Application Details</h3>
          <ul>
            <li><strong>Job Title:</strong> ${job.title}</li>
            <li><strong>Company:</strong> ${job.company}</li>
            <li><strong>Location:</strong> ${job.location}</li>
            <li><strong>Date Applied:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          ${job.coverLetter ? `<h4>📄 Cover Letter</h4><p>${job.coverLetter}</p>` : ''}
          ${Array.isArray(job.answers) ? `
            <h4>🧠 Answers</h4>
            ${job.answers.map((ans, i) => `<p><strong>Q${i + 1}:</strong> ${ans}</p>`).join('')}
          ` : ''}
          <p>Best of luck with your application! 🚀</p>
        `
      });

      console.log("📧 Email sent to:", user.email);
    }

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
    jobId, userId, jobTitle, company, location,
    description, answers, coverLetter, userProfile
  } = req.body;

  if (!jobId || !userId || !jobTitle || !company) {
    return res.status(400).json({ error: 'Missing required job or user fields.' });
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Answers must be a non-empty array.' });
  }

  console.log("📥 AI Submit Payload:", {
    jobId, userId, jobTitle, company, location, description, answers, coverLetter
  });

  try {
    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        jobTitle,
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
        subject: `✅ Application Submitted: ${jobTitle} at ${company}`,
        html: `
          <p>Hi ${userProfile.name || "there"},</p>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> was submitted using Job Assistant AI.</p>
          <h3>🧾 Application Details</h3>
          <ul>
            <li><strong>Job Title:</strong> ${jobTitle}</li>
            <li><strong>Company:</strong> ${company}</li>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Date Applied:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          ${coverLetter ? `<h4>📄 Cover Letter</h4><p>${coverLetter}</p>` : ''}
          ${Array.isArray(answers) ? `
            <h4>🧠 Answers</h4>
            ${answers.map((ans, i) => `<p><strong>Q${i + 1}:</strong> ${ans}</p>`).join('')}
          ` : ''}
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

const getApplicationsByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const apps = await prisma.application.findMany({
      where: { userId: id },
      orderBy: { dateApplied: 'desc' }
    });
    res.status(200).json(apps);
  } catch (err) {
    console.error("❌ Failed to fetch applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

module.exports = {
  autofillApplication,
  generateAnswerForQuestions,
  aiSubmitApplication,
  getApplicationsByUser
};
