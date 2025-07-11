import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function AutoFillApplication() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [questions, setQuestions] = useState([
    { question: "Why do you want to work here?", answer: "" },
    { question: "What attracts you to this role?", answer: "" },
    { question: "How does this align with your future goals?", answer: "" },
  ]);
  const [userProfile, setUserProfile] = useState(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const res = await API.get(`/jobs/details/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error("❌ Failed to load job details:", err);
      }
    }
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await API.get(`/users/${job.userId}`);
        setUserProfile(res.data);
      } catch (err) {
        console.error("❌ Failed to load user profile:", err);
      }
    }
    if (job?.userId) fetchUserProfile();
  }, [job]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTip(false), 60000); // 1 minute
    return () => clearTimeout(timer);
  }, []);

  // Prefill recruiter answers using AI after job and userProfile are loaded
  async function fetchAIAnswers() {
    console.log("🧠 Triggering fetchAIAnswers with:", job?.userId, jobId);
    if (!job?.userId || !jobId) {
      console.warn("🚫 Cannot generate answers – missing jobId or userId");
      return;
    }
    try {
      console.log("📤 Sending request to generate recruiter answers...");
      const res = await API.post("/generate/recruiter-answers", {
        jobId: jobId,
        userId: job.userId,
        questions: questions.map(q => q.question),
      });
      const answered = res.data.answers.map(ans => ({
        question: ans.question,
        answer: ans.answer
      }));
      setQuestions(answered);
      console.log("✅ AI Answers updated");
    } catch (err) {
      console.error("❌ Failed to fetch recruiter answers:", err);
    }
  }

  useEffect(() => {
    console.log("📌 jobId or job.userId changed:", { jobId, userId: job?.userId });
    if (job?.userId && jobId) {
      console.log("✅ Triggering fetchAIAnswers from unified useEffect");
      fetchAIAnswers();
    }
  }, [jobId, job?.userId]);

  // Prefill cover letter using AI after job and userProfile are loaded
  async function fetchCoverLetter() {
    if (!job?.userId) return;
    try {
      const res = await API.post("/generate/cover-letter", {
        jobId: jobId,
        userId: job.userId,
      });
      setCoverLetter(res.data.coverLetter || "");
    } catch (err) {
      console.error("❌ Failed to generate cover letter:", err);
    }
  }

  useEffect(() => {
    if (job?.userId && jobId) {
      fetchCoverLetter();
    }
  }, [jobId]);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].answer = value;
    setQuestions(updated);
  };

  const handleAskAI = async () => {
    console.log("📤 Sending to backend (custom question):", {
      jobDescription: job?.description,
      userProfile,
      question: customQuestion,
    });

    if (!job?.description || !userProfile || !customQuestion) {
      console.warn("🚫 Missing job description, user profile or custom question");
      return;
    }

    try {
      const res = await API.post("/generate/ask", {
        jobDescription: job.description,
        resumeText: JSON.stringify(userProfile),
        question: customQuestion,
      });
      alert("🧠 AI says: " + res.data.answer);
    } catch (err) {
      console.error("❌ Failed to get AI response:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save job in SuggestedJob table before applying
      await API.post("/suggested-jobs", {
        id: jobId,
        title: job.job_title,
        company: job.company_name,
        location: job.locations?.join(", ") || "",
        description: job.description,
        userId: job.userId,
        isAI: true
      });
      const res = await API.post("/applications/apply", {
        jobId,
        userId: job.userId,
        title: job.job_title,
        company: job.company_name,
        location: job.locations?.join(", ") || "",
        description: job.description,
        answers: questions,
        coverLetter
      });
      alert("✅ Application submitted!");
      // Don't navigate to dashboard here — it's already added in SuggestedJob click
    } catch (err) {
      console.error("❌ Failed to save application:", err);
      alert("❌ Failed to submit application");
    }
  };

  if (!job) return <div className="p-4">Loading job description...</div>;

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Left: Job Description */}
      <div className="bg-white p-4 rounded shadow h-full overflow-auto space-y-4">
        <h2 className="text-2xl font-bold">{job.job_title}</h2>
        <p className="text-sm text-gray-600">{job.company_name}</p>
        <p className="text-sm text-gray-500">{job.locations?.join(", ")}</p>

        <hr />

        <section>
          <h3 className="font-semibold text-lg">Requirements</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 whitespace-pre-line">
            {job.job_highlights?.Qualifications?.map((req, i) => <li key={i}>{req}</li>)}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg">Responsibilities</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 whitespace-pre-line">
            {job.job_highlights?.Responsibilities?.map((res, i) => <li key={i}>{res}</li>)}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg">Why This Company?</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {job.job_highlights?.Benefits?.map((item, i) => <li key={i}>✅ {item}</li>)}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg">Company News</h3>
          {Array.isArray(job.companyInsights) && job.companyInsights.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-1">
              {job.companyInsights.map((news, i) =>
                news?.title && (news.link || news.url) ? (
                  <li key={i}>
                    <a
                      href={encodeURI(news.link || news.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      title={news.title}
                    >
                      {news.title}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No recent company news available.</p>
          )}
        </section>
      </div>

      {/* Right: Application Form */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold">Recruiter Questions</h3>
        {showTip && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 text-sm rounded mb-3 shadow-sm relative">
            <button
              onClick={() => setShowTip(false)}
              className="absolute top-1 right-2 text-yellow-700 hover:text-red-500 text-sm font-bold"
              title="Dismiss"
            >
              ✕
            </button>
            ⏳ Please wait a few moments while we auto-generate answers. 
            If they don't appear within a minute, click "Generate AI Answers" manually.
          </div>
        )}
        <p className="text-sm text-gray-500 mb-3">
          These common questions help tailor your application using AI. Fill them out to improve your application's effectiveness. You can modify or enhance the suggested answers.
        </p>
        {questions.map((q, index) => (
          <div key={index} className="mb-3">
            <label className="block font-medium text-sm mb-1">{q.question}</label>
            <textarea
              value={q.answer}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              className="w-full border rounded p-2 text-sm"
              rows={2}
              placeholder="Your personalized response..."
            />
          </div>
        ))}
        <button
          onClick={() => {
            console.log("📤 Generate AI Answers button clicked");
            fetchAIAnswers();
          }}
          className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded hover:bg-blue-200 mb-4"
        >
          🔁 Generate AI Answers
        </button>

        {/* Cover Letter */}
        <div className="flex items-start">
          <div className="flex-1">
            <label className="block font-medium text-sm mb-1">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              rows={6}
            />
          </div>
          {!coverLetter && (
            <button
              onClick={() => fetchCoverLetter()}
              className="ml-2 bg-green-100 text-green-800 px-3 py-1 text-sm rounded hover:bg-green-200"
            >
              📝 Generate Cover Letter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="flex-1 border rounded p-2 text-sm"
            placeholder="Ask the AI a custom question"
          />
          <button
            onClick={handleAskAI}
            className="bg-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-300"
          >
            Ask AI
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}