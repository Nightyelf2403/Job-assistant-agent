import React, { useEffect, useState } from "react";
// Inline style for AI badge
const aiBadgeStyle = {
  backgroundColor: '#d4f4ff',
  color: '#0077b6',
  fontWeight: '600',
  fontSize: '12px',
  padding: '2px 6px',
  borderRadius: '4px',
  display: 'inline-block',
  marginTop: '4px'
};
import { useNavigate } from "react-router-dom";
import API from "../api";

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayed((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20); // adjust speed as needed
    return () => clearInterval(interval);
  }, [text]);

  return <p className="mt-2 text-sm text-gray-600">{displayed}</p>;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showInfo, setShowInfo] = useState({});
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [normalJobs, setNormalJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Recruiter questions editing state
  const recruiterQuestions = [
    { question: "Why do you want to work here?", answer: "I am passionate about the company's mission and values." },
    { question: "Describe a challenging project you worked on.", answer: "I led a team to develop a scalable web app under tight deadlines." },
    { question: "What are your strengths?", answer: "Strong problem-solving skills and excellent teamwork." }
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState(recruiterQuestions.map(q => q.answer));


  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await API.get(`/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
      }
    }
    fetchUser();
  }, []);

  // Effect to listen for storage changes to re-fetch user data when jobs are applied elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem("refreshApplications") === "true") {
        // Re-fetch user data
        async function fetchUser() {
          try {
            const res = await API.get(`/users/${userId}`);
            setUser(res.data);
          } catch (err) {
            console.error("❌ Failed to fetch user:", err);
          }
        }
        fetchUser();
        localStorage.removeItem("refreshApplications");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  async function fetchJobs(forceRefresh = false) {
    setLoadingJobs(true);
    try {
      const res = await API.get(`/jobs/suggested/${userId}`, {
        params: { refresh: forceRefresh ? "true" : "false" }
      });

      // Debug: log raw API suggested jobs
      console.log("📦 Raw suggested jobs from API:", res.data.suggestedByAI);
      const suggested = (res.data.suggestedByAI || []).map(job => {
        console.log("🧠 Suggested Job:", job);
        return {
          ...job,
          isAI: true,
          matchScore: job.matchScore || job.match_score || null,
          reason: job.reason || job.match_reason || null,
        };
      });
      // Debug: log parsed suggested jobs
      console.log("✅ Parsed suggested jobs for display:", suggested);
      // 🐛 Debug log before setting state
      console.log("🐛 Filtered AI Jobs Before Setting State:", suggested);

      const normal = res.data.normalJobs || [];

      setSuggestedJobs(suggested);
      setNormalJobs(normal);

      if (forceRefresh) {
        setRefreshCooldown(180); // 3 minutes in seconds
      }
    } catch (err) {
      console.error("❌ Failed to fetch suggested jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }
  // Cooldown timer effect for refresh button
  useEffect(() => {
    if (refreshCooldown > 0) {
      const interval = setInterval(() => {
        setRefreshCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [refreshCooldown]);
  useEffect(() => {
    fetchJobs(false); // Only load cached jobs on initial load
  }, []);

  const toggleLearnMore = (agent) => {
    setShowInfo((prev) => ({ ...prev, [agent]: !prev[agent] }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/signin");
  };

  // Add useEffect to listen for Escape key to close modal
  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape") {
        setSelectedJob(null);
      }
    }

    if (selectedJob) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [selectedJob]);

  if (!user) return <div className="p-8">Sign-In or Sign-Up To View DashBoard!!...</div>;

return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8 text-gray-800 leading-relaxed tracking-wide">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Autofill Agent", icon: "🧠", desc: "Apply with saved data", key: "autofill" },
          { title: "Resume-to-JD Score Agent", icon: "📊", desc: "See match score", key: "score" },
          { title: "Tailored Answer Agent", icon: "✍️", desc: "Generate answers", key: "answer" }
        ].map((agent) => (
          <div
            key={agent.key}
            className="bg-white p-5 rounded-2xl shadow-md border hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out"
          >
            <h3 className="text-lg font-semibold">{agent.icon} {agent.title}</h3>
            <p className="text-sm mt-2 text-gray-600">{agent.desc}</p>
            <button
              className="mt-3 text-indigo-600 hover:underline"
              onClick={() => toggleLearnMore(agent.key)}
            >
              Learn more
            </button>
            {showInfo[agent.key] && (
              <TypingText
                text={
                  agent.key === "autofill"
                    ? "Automatically fills application forms using your saved details."
                    : agent.key === "score"
                    ? "Compares your resume against job descriptions for match quality."
                    : "Creates personalized responses for job application questions."
                }
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Layout: Applications + Suggested Jobs */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {/* Applications */}
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">📊 Application Tracker</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-2">Job Title</th>
                  <th scope="col" className="px-4 py-2">Company</th>
                  <th scope="col" className="px-4 py-2">Date Applied</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {user?.applications?.map((app, idx) => (
                  <tr key={idx} className="bg-white border-b">
                    <td className="px-4 py-2">{app.title}</td>
                    <td className="px-4 py-2">{app.company}</td>
                    <td className="px-4 py-2">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-green-600">
                      ✅ Applied
                      <progress value="100" max="100" className="w-full h-2 rounded bg-gray-200 text-green-600 mt-1" />
                    </td>
                  </tr>
                ))}
                <tr className="bg-white border-b">
                  <td className="px-4 py-2">Software Intern</td>
                  <td className="px-4 py-2">Google</td>
                  <td className="px-4 py-2">2025-07-01</td>
                  <td className="px-4 py-2 text-green-600">
                    ✅ Applied
                    <progress value="100" max="100" className="w-full h-2 rounded bg-gray-200 text-green-600 mt-1" />
                  </td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-4 py-2">ML Intern</td>
                  <td className="px-4 py-2">Meta</td>
                  <td className="px-4 py-2">2025-07-02</td>
                  <td className="px-4 py-2 text-yellow-600">
                    ⏳ Awaiting
                    <progress value="50" max="100" className="w-full h-2 rounded bg-gray-200 text-yellow-600 mt-1" />
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-2">Frontend Developer</td>
                  <td className="px-4 py-2">Amazon</td>
                  <td className="px-4 py-2">2025-07-03</td>
                  <td className="px-4 py-2 text-red-600">
                    ❌ Rejected
                    <progress value="0" max="100" className="w-full h-2 rounded bg-gray-200 text-red-600 mt-1" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Suggested Jobs */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">💼 Suggested Jobs</h2>
            <button
              onClick={() => {
                if (refreshCooldown === 0) {
                  fetchJobs(true);
                }
              }}
              className={`text-sm ${refreshCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
              disabled={refreshCooldown > 0}
            >
              🔄 Refresh {refreshCooldown > 0 && `(${refreshCooldown}s)`}
            </button>
          </div>
          {loadingJobs ? (
            <p className="text-gray-500">Loading new suggestions...</p>
          ) : suggestedJobs.length === 0 && normalJobs.length === 0 ? (
            <p>No job suggestions yet.</p>
          ) : (
            <>
              <p className="text-xs text-green-600">Showing {suggestedJobs.length} suggested and {normalJobs.length} normal jobs</p>
              <ul className="max-h-[500px] overflow-y-auto space-y-3 text-sm text-gray-700 list-none pl-0">
                {console.log("👁️ Rendering suggestedJobs:", suggestedJobs)}
                {suggestedJobs.map((job, index) => {
                  // Skip undefined or empty jobs
                  if (!job || !job.job_title) return null;
                  // Debug log for rendering AI job
                  console.log("🧠 Rendering AI Job:", job);
                  const company = job.employer_name || job.company_name || job.Company || "Unknown Company";
                  const location =
                    job.job_location ||
                    job.job_city ||
                    job.job_country ||
                    (job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : "") ||
                    job.Location ||
                    "Unknown Location";

                  return (
                    <li
                      key={index}
                      className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg">{job.job_title || job.JobTitle}</p>
                          <p className="text-sm text-gray-600">{company}</p>
                        </div>
                        <div className="text-sm text-gray-500">{location}</div>
                      </div>
                      <p className="text-xs mt-1 text-gray-500">
                        🎯 Match Score: {job.matchScore || "N/A"} <br />
                        💡 Reason: {job.reason || "Not specified"}
                      </p>
                      {job.isAI && <span style={aiBadgeStyle}>Suggested by AI</span>}
                      {job.job_apply_link && (
                        <div className="mt-1">
                          <a
                            href={job.job_apply_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View & Apply
                          </a>
                        </div>
                      )}
                      <button
                        className="mt-2 text-sm text-indigo-600 hover:underline"
                        onClick={async (e) => {
                          e.stopPropagation(); // prevent triggering setSelectedJob

                          try {
                            const userId = localStorage.getItem("userId");

                            await API.post("/suggested-jobs", {
                              id: job.id || job.job_id || job.JobID,
                              title: job.job_title || job.title,
                              company: job.employer_name || job.company_name || job.Company,
                              location: job.job_location || job.job_city || job.Location,
                              description: job.job_description || job.description,
                              userId,
                              isAI: true,
                            });

                            // Set flag to refresh applications on other tabs
                            localStorage.setItem("refreshApplications", "true");
                            localStorage.setItem("jobToApply", JSON.stringify(job));
                            navigate(`/autofill/${job.job_id || job.JobID || job.id}`);
                          } catch (err) {
                            console.error("❌ Failed to save job before autofill navigation:", err);
                            alert("Failed to save job. Please try again.");
                          }
                        }}
                      >
                        Auto Apply
                      </button>
                    </li>
                  );
                })}

                <h3 className="mt-4 font-semibold text-gray-800">🔎 More Jobs You Might Like</h3>
                {normalJobs.map((job, index) => (
                  <li
                    key={`normal-${index}`}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{job.job_title || job.JobTitle}</p>
                        <p className="text-sm text-gray-600">{job.employer_name || job.company_name || "Unknown Company"}</p>
                      </div>
                      <div className="text-sm text-gray-500">{job.job_location || job.job_city || "Unknown Location"}</div>
                    </div>
                    {job.job_apply_link && (
                      <div className="mt-1">
                        <a
                          href={job.job_apply_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View & Apply
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    {/* Modal for selected job */}
    {selectedJob && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-white max-w-2xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] relative">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
            onClick={() => setSelectedJob(null)}
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold mb-2">{selectedJob.job_title || selectedJob.JobTitle}</h2>
          <p className="text-gray-700 mb-1"><strong>Company:</strong> {selectedJob.employer_name || selectedJob.company_name || "N/A"}</p>
          <p className="text-gray-700 mb-1"><strong>Location:</strong> {selectedJob.job_location || selectedJob.job_city || "N/A"}</p>
          <p className="text-gray-700 mb-2"><strong>Match Score:</strong> {selectedJob.matchScore || "N/A"}</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {selectedJob.job_description || selectedJob.description || "No description available."}
          </p>
          {/* Recruiter Questions Review Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Recruiter Questions Review</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {recruiterQuestions.map(({ question, answer }, idx) => (
                <li key={idx}>
                  <p className="font-semibold">{question}</p>
                  {isEditing ? (
                    <textarea
                      className="w-full mt-1 p-1 border rounded"
                      value={editedAnswers[idx]}
                      onChange={(e) => {
                        const newAnswers = [...editedAnswers];
                        newAnswers[idx] = e.target.value;
                        setEditedAnswers(newAnswers);
                      }}
                    />
                  ) : (
                    <p className="ml-2">{answer}</p>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <a
              href={selectedJob.job_apply_link}
              target="_blank"
              rel="noreferrer"
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Apply Externally
            </a>
            <button
              onClick={async () => {
                try {
                  const userId = localStorage.getItem("userId");

                  await API.post("/suggested-jobs", {
                    id: selectedJob.id || selectedJob.job_id || selectedJob.JobID,
                    title: selectedJob.job_title || selectedJob.title,
                    company: selectedJob.employer_name || selectedJob.company_name || selectedJob.Company,
                    location: selectedJob.job_location || selectedJob.job_city || selectedJob.Location,
                    description: selectedJob.job_description || selectedJob.description,
                    userId,
                    isAI: true
                  });

                  // Set flag to refresh applications on other tabs
                  localStorage.setItem("refreshApplications", "true");
                  // Save job to localStorage and navigate
                  localStorage.setItem("jobToApply", JSON.stringify(selectedJob));
                  navigate(`/autofill/${selectedJob.job_id || selectedJob.JobID || selectedJob.id}`);
                } catch (err) {
                  console.error("❌ Failed to save job before autofill navigation:", err);
                  alert("Failed to save job. Please try again.");
                }
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Apply via Autofill
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}