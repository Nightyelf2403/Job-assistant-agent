const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userRefreshTimestamps = {}; // Tracks per-user refresh cooldowns
global.normalJobs = [];

// Helper function for extracting resume text from PDF using pdf-parse
async function extractResumeText(resumePath) {
  try {
    const fullPath = path.isAbsolute(resumePath) ? resumePath : path.join(__dirname, '..', resumePath);
    const dataBuffer = fs.readFileSync(fullPath);
    const data = await pdfParse(dataBuffer);
    if (!data.text || data.text.trim().length === 0) {
      console.warn("⚠️ PDF content missing or empty");
      return "";
    }
    return data.text;
  } catch (error) {
    console.error("❌ Error reading or parsing PDF:", error.message);
    return "";
  }
}

const AZURE_GPT_ENDPOINT = "https://adihub3504002192.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview";
const AZURE_API_KEY = process.env.AZURE_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY is missing from .env");

// function getStrictJsonResponse is moved below forceJsonArray and before extractResumeText

async function callGPT(prompt) {
  try {
    const response = await axios.post(
      AZURE_GPT_ENDPOINT,
      {
        messages: [
          {
            role: "system",
            content: `
⚠️⚠️⚠️ CRITICAL INSTRUCTION ⚠️⚠️⚠️
You MUST respond ONLY with a raw JSON array. Nothing else.

🚫 STRICTLY PROHIBITED:
- Any text outside the array brackets
- Markdown formatting (\`\`\`json)
- Explanations, comments, or <think> tags
- Headers, footers, or section titles

✅ REQUIRED FORMAT:
[{"field":"value"}]

🛑 CONSEQUENCES OF DISOBEDIENCE:
If you include ANY non-JSON text, the API integration will fail.

📌 EXAMPLES:
Correct: [{"job_id":"123","match":85}]
Incorrect: Here's the result: [{"job_id":"123"}]

🔒 FINAL WARNING:
Your response must parse directly with JSON.parse() with no preprocessing.
`
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 2048
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY,
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ GPT AI call failed:", error.message);
    console.log("🔑 Using GPT API Key:", AZURE_API_KEY ? '✅ Present' : '❌ Missing');
    throw error;
  }
}

function validateAndCleanAIResponse(content) {
  console.log("🔍 Raw AI response preview:", content.slice(0, 1000)); // Optional: log raw AI response
  try {
    return JSON.parse(content);
  } catch (e) {
    console.warn("⚠️ Standard JSON.parse failed, attempting fallback extraction...");
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      console.error("❌ No valid JSON array markers found in response.");
      throw new Error("No valid JSON array found in response");
    }

    const rawJson = content.slice(jsonStart, jsonEnd);
    try {
      return JSON.parse(rawJson);
    } catch (fallbackError) {
      console.warn("⚠️ Fallback JSON.parse failed. Trying forceJsonArray...");
      return forceJsonArray(content);
    }
  }
}

function forceJsonArray(content) {
  const cleaned = content.trim().replace(/^.*?(\[)/s, '$1').replace(/(\])[^]*$/, '$1');
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("❌ Failed to parse after cleaning:", cleaned);
    return [];
  }
}

// Retry wrapper for strict JSON response from GPT
async function getStrictJsonResponse(prompt, maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const aiContent = await callGPT(prompt);
      console.log(`🧠 GPT attempt ${attempt + 1} succeeded`);
      const json = validateAndCleanAIResponse(aiContent);
      if (Array.isArray(json)) return json;
    } catch (e) {
      console.warn(`⚠️ GPT attempt ${attempt + 1} failed:`, e.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
    attempt++;
  }
  throw new Error("All GPT attempts failed to return valid JSON.");
}

async function getCompanyInsights(companyName) {
  const prompt = `
Provide a JSON array of up to 5 recent (2024–2025) news article titles and links about the company "${companyName}". Only include direct news links (from sites like Forbes, CNBC, Bloomberg, etc.), not blog posts or unrelated sources. Format:
[{"title": "...", "url": "https://..." }]
`;
  try {
    const insights = await getStrictJsonResponse(prompt);
    return insights;
  } catch (error) {
    console.error("❌ Error fetching company insights:", error.message);
    return [];
  }
}

const getRemoteJobs = async (req, res) => {
  const userId = req.params.id;
  console.log("🔍 getRemoteJobs called for user:", userId);
  // Per-user refresh cooldown
  const now = Date.now();
  const lastRefresh = userRefreshTimestamps[userId] || 0;
  const threeMinutes = 3 * 60 * 1000;

  if (!(req.query.refresh === "true" && now - lastRefresh > threeMinutes)) {
    console.log("⚠️ Returning cached jobs for user:", userId);
    const suggestedByAI = (global.cachedJobs || []).filter(j => j.source === "Suggested by AI");
    const normalJobs = (global.cachedJobs || []).filter(j => j.source === "Normal");
    return res.json({
      suggestedByAI,
      normalJobs,
      nextRefreshAt: lastRefresh + threeMinutes
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log("❌ No user found with ID:", userId);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("✅ User found:", user);

    const resumeText = await extractResumeText(user.resumeLink || "");

    const query = user.jobType || "developer";
    const location = user.currentLocation || "remote";

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query,
        location,
        page: 1,
        num_pages: 2,
        date_posted: "all"
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    const jobs = response.data?.data || [];
    console.log("📦 Fetched jobs from API:", jobs.length);

    const aiInputJobs = jobs
      .sort((a, b) => (b.job_description?.length || 0) - (a.job_description?.length || 0))
      .slice(0, 10);

    const { jobType, currentLocation, preferredLocations, skills, desiredSalary, workPreference } = user;
    const userSummary = { jobType, currentLocation, preferredLocations, skills, desiredSalary, workPreference };

    const prompt = `
You are a JSON-only AI. Your ONLY task is to return an array of job matches from the given input.

🚫 DO NOT include full job descriptions, job_title, job_logo, or any extra fields.
✅ ONLY include the following keys:
  - job_id (string)
  - matchScore (30–100)
  - reason (short string, one line)
  - employer_name
  - job_location

✅ Format:
[
  {
    "job_id": "abc123",
    "matchScore": 82,
    "reason": "Good skill + location match",
    "employer_name": "Company X",
    "job_location": "Remote"
  }
]
Return at most 8 jobs only.

Candidate Profile:
${JSON.stringify(userSummary, null, 2)}

Resume Extract:
${resumeText.slice(0, 1000)}

Job Listings:
${JSON.stringify(aiInputJobs, null, 2)}
`;
    let filteredJobs;
    try {
      console.log("🧠 Calling GPT with retry...");
      // Debug: Prompt length
      console.log("📏 Prompt length:", prompt.length);
      filteredJobs = await getStrictJsonResponse(prompt);
      // Debug: Truncated response length
      if (filteredJobs && typeof filteredJobs === 'string') {
        console.log("📉 Truncated response length:", filteredJobs.length);
      } else if (filteredJobs && Array.isArray(filteredJobs)) {
        try {
          console.log("📉 Truncated response length:", JSON.stringify(filteredJobs).length);
        } catch (e) {}
      }
      filteredJobs = filteredJobs.map(match => {
        const full = jobs.find(j => j.job_id === match.job_id) || {};

        const employer =
          full.employer_name ||
          full.company_name ||
          full.job_publisher ||
          full.job_employer_name ||
          "Unknown Company";

        const location =
          full.job_location ||
          full.job_city ||
          (full.job_city && full.job_state ? `${full.job_city}, ${full.job_state}` : "") ||
          full.job_country ||
          full.location ||
          full.job_location_string ||
          "Unknown Location";

        return {
          ...full,
          employer_name: match.employer_name || employer,
          job_location: match.job_location || location,
          matchScore: match.matchScore,
          reason: match.reason,
          source: 'Suggested by AI'
        };
      }).slice(0, 8);

      const normalJobs = jobs.filter(j => !filteredJobs.find(fj => fj.job_id === j.job_id)).slice(0, 10).map(job => ({
        ...job,
        source: 'Normal'
      }));

      global.cachedJobs = [...filteredJobs, ...normalJobs];
      userRefreshTimestamps[userId] = now;

      console.log("✅ Filtered jobs from AI:", filteredJobs.length);
      console.log("📋 First job sample:", JSON.stringify(filteredJobs[0], null, 2));

      console.log("🚀 Returning suggested and normal jobs");
      res.json({
        suggestedByAI: filteredJobs,
        normalJobs: normalJobs,
        nextRefreshAt: now + threeMinutes
      });
    } catch (err) {
      console.error("❌ GPT response completely unparseable or invalid:", err.message);
      return res.status(500).json({ error: "AI response was not valid JSON", detail: err.message });
    }
  } catch (error) {
    console.error("❌ Error in getRemoteJobs:", error);
    res.status(500).json({ error: "Failed to fetch AI-filtered jobs", detail: error.message });
  }
};

// ✅ Save Job for user
const saveJob = async (req, res) => {
  const { userId, title, company, location, details } = req.body;

  if (!userId || !title || !company || !location || !details) {
    return res.status(400).json({ error: "Missing required job fields" });
  }

  try {
    const saved = await prisma.savedJob.create({
      data: {
        userId,
        title,
        company,
        location,
        details,
      },
    });

    res.status(201).json({ message: "Job saved successfully", job: saved });
  } catch (error) {
    console.error("❌ Error saving job:", error);
    res.status(500).json({ error: "Failed to save job", detail: error.message });
  }
};

// ✅ Get Full Job by ID (for modal job view)
const getSuggestedJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const allJobs = [...(global.cachedJobs || []), ...(global.normalJobs || [])];
    const job = allJobs.find(j => j.job_id === id);
    if (!job) {
      return res.status(404).json({ error: "Job not found in cache" });
    }
    res.json(job);
  } catch (error) {
    console.error("❌ Error fetching job by ID:", error);
    res.status(500).json({ error: "Failed to get job details" });
  }
};

// ✅ Get Job Details (for details endpoint)
const getJobDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const allJobs = [...(global.cachedJobs || []), ...(global.normalJobs || [])];
    const job = allJobs.find(j => j.job_id === id);
    if (!job) {
      return res.status(404).json({ error: "Job not found in cache" });
    }

    // Map job_description to description if missing, and handle employer_name fallback
    const fullJob = {
      ...job,
      description: job.description || job.job_description || "",
      employer_name: job.employer_name || job.company_name || "Unknown Company"
    };

    const insights = await getCompanyInsights(fullJob.employer_name);
    const application = await prisma.application.findFirst({
      where: { jobId: id },
      select: { userId: true }
    });
    const user = application?.userId
      ? await prisma.user.findUnique({ where: { id: application.userId } })
      : null;
    res.json({
      ...fullJob,
      companyInsights: insights,
      userId: application?.userId || null,
      userProfile: user || null
    });
  } catch (error) {
    console.error("❌ Error fetching job details:", error);
    res.status(500).json({ error: "Failed to retrieve job details" });
  }
};

// ✅ Apply via Autofill (stores application in DB)
const applyViaAutofill = async (req, res) => {
  const { userId, job } = req.body;
  if (!userId || !job?.job_id || !job?.employer_name || !job?.job_title) {
    return res.status(400).json({ error: "Missing job or user details" });
  }

  try {
    const applied = await prisma.application.create({
      data: {
        userId,
        jobId: job.job_id,
        title: job.job_title || "Untitled Job",
        company: job.employer_name || "Unknown Company",
        location: job.job_location || job.job_country || "Unknown",
        description: job.job_description || "",
        applyLink: job.job_apply_link || job.job_google_link || job.job_url || "",
        status: "Applied",
        appliedAt: new Date()
      }
    });

    res.status(201).json({ message: "Applied successfully", application: applied });
  } catch (error) {
    console.error("❌ Error applying via autofill:", error);
    res.status(500).json({ error: "Failed to apply via autofill", detail: error.message });
  }
};

module.exports = {
  getRemoteJobs,
  saveJob,
  getSuggestedJobById,
  applyViaAutofill,
  getJobDetails,
  getCompanyInsights,
};