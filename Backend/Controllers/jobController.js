const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper function for extracting resume text from PDF using pdf-parse
async function extractResumeText(resumePath) {
  try {
    const fullPath = path.join(__dirname, '..', resumePath);
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


const getRemoteJobs = async (req, res) => {
  const userId = req.params.id;
  console.log("🔍 getRemoteJobs called for user:", userId);
  // Serve from cache if available and not a refresh
  if (!req.query.refresh && global.cachedJobs?.length > 0) {
    console.log("🗂️ Serving cached jobs...");
    return res.json({ suggestedJobs: global.cachedJobs, label: "Suggested by AI (Cached)" });
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
        num_pages: 6,
        date_posted: "all"
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    const jobs = response.data?.data || [];
    console.log("📦 Fetched jobs from API:", jobs.length);

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
Return at most 3 jobs only.

Candidate Profile:
${JSON.stringify(userSummary, null, 2)}

Resume Extract:
${resumeText.slice(0, 1000)}

Job Listings:
${JSON.stringify(
  jobs
    .sort((a, b) => (b.job_description?.length || 0) - (a.job_description?.length || 0))
    .slice(0, 3),
  null,
  2
)}
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
        // If getStrictJsonResponse returns array, try to estimate original response length
        try {
          console.log("📉 Truncated response length:", JSON.stringify(filteredJobs).length);
        } catch (e) {
          // Fallback if stringify fails
        }
      }
      // Ensure location and employer data are present or inferred
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
          reason: match.reason
        };
      });
      console.log("✅ Filtered jobs from AI:", filteredJobs.length);
      console.log("📋 First job sample:", JSON.stringify(filteredJobs[0], null, 2));
    } catch (err) {
      console.error("❌ GPT response completely unparseable or invalid:", err.message);
      return res.status(500).json({ error: "AI response was not valid JSON", detail: err.message });
    }

    console.log("🚀 Returning suggested jobs");
    global.cachedJobs = filteredJobs;
    res.json({ suggestedJobs: filteredJobs, label: "Suggested by AI" });
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

module.exports = {
  getRemoteJobs,
  saveJob,
};