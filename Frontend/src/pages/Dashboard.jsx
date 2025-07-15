import React, { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";
import rocketAnimation from "../assets/platform-growth.json";
// Custom waving hand animation for the Dashboard header
// You can move this to your global CSS if desired.
const style = document.createElement("style");
style.innerHTML = `
@keyframes wave {
  0% { transform: rotate(0.0deg) }
  10% { transform: rotate(14.0deg) }
  20% { transform: rotate(-8.0deg) }
  30% { transform: rotate(14.0deg) }
  40% { transform: rotate(-4.0deg) }
  50% { transform: rotate(10.0deg) }
  60% { transform: rotate(0.0deg) }
  100% { transform: rotate(0.0deg) }
}
.animate-wave {
  animation: wave 2s infinite;
  display: inline-block;
  transform-origin: 70% 70%;
}
`;
if (typeof document !== "undefined" && !document.getElementById("dashboard-wave-animation")) {
  style.id = "dashboard-wave-animation";
  document.head.appendChild(style);
}
import CountUp from 'react-countup';
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
const agents = [
  {
    title: "Autofill Agent",
    icon: "🧠",
    desc: "Apply with saved data",
    key: "autofill",
    description: "Automatically fills application forms using your saved details."
  },
  {
    title: "Resume-to-JD Score Agent",
    icon: "📊",
    desc: "See match score",
    key: "score",
    description: "Compares your resume against job descriptions for match quality."
  },
  {
    title: "Tailored Answer Agent",
    icon: "✍️",
    desc: "Generate answers",
    key: "answer",
    description: "Creates personalized responses for job application questions."
  }
];
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
    setDisplayed(""); // Reset on text change
    const interval = setInterval(() => {
      if (index < (text?.length || 0)) {
        setDisplayed((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 70); // slower typing speed
    return () => clearInterval(interval);
  }, [text]);

  return <p className="mt-2 text-sm text-gray-600">{displayed}</p>;
}

export default function Dashboard() {
  // User Testimonials - Animated Carousel State
  const testimonials = [
    { text: "“Got an interview thanks to the Tailored Answer Agent!” – Aman", rating: 5 },
    { text: "“Autofill saved me hours. Amazing!” – Priya", rating: 4 },
    { text: "“This tool helped me target the right roles!” – Sarah", rating: 5 },
    { text: "“The resume scoring really boosted my confidence.” – David", rating: 3 },
    { text: "“The dashboard is clean and intuitive. Loved the layout!” – Arjun", rating: 4 },
    { text: "“I applied to 10 jobs in one evening using this tool!” – Nisha", rating: 5 },
    { text: "“Tailored answers were so on point, recruiters responded fast.” – Omar", rating: 4 },
    { text: "“I was skeptical but it actually worked. Great job team!” – Meera", rating: 5 },
    { text: "“Resume analyzer highlighted exactly what I was missing.” – Kevin", rating: 4 },
    { text: "“AI suggestions felt personal and relevant. Impressed.” – Anjali", rating: 5 }
  ];
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  const [user, setUser] = useState(null);
  const [showInfo, setShowInfo] = useState({});
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [normalJobs, setNormalJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
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
  const shouldRefresh = localStorage.getItem("refreshApplications") === "true";
  async function fetchUser() {
    try {
      const res = await API.get(`/users/${userId}`);
      setUser(res.data);
      localStorage.removeItem("refreshApplications");
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
    }
  }
  if (shouldRefresh || !user) {
    fetchUser();
  }
  // eslint-disable-next-line
}, []);

// Fallback effect to fetch user on initial render if not already present
useEffect(() => {
  if (!user) {
    async function fetchUser() {
      try {
        const res = await API.get(`/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
      }
    }
    fetchUser();
  }
  // eslint-disable-next-line
}, []);

  // Fetch recruiter answers when a job is selected
  useEffect(() => {
    async function fetchRecruiterAnswers() {
      if (!selectedJob) return;
      const jobId = selectedJob.id || selectedJob.job_id || selectedJob.JobID;
      const userId = localStorage.getItem("userId");
      console.log("🔄 Fetching recruiter answers for job:", jobId);

      try {
        const res = await API.post("/generate/recruiter-answers", {
          jobId,
          userId,
          questions: [
            "Why do you want to work here?",
            "What attracts you to this role?",
            "How does this align with your future goals?"
          ]
        });

        if (res.data.answers) {
          setEditedAnswers(res.data.answers.map(a => a.answer));
        } else {
          console.warn("⚠️ No answers returned from backend");
        }
      } catch (err) {
        console.error("❌ Failed to fetch recruiter answers:", err);
      }
    }

    fetchRecruiterAnswers();
  }, [selectedJob]);

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

  // Carousel logic for Features cards
  const carouselRef = useRef();
  const [currentCard, setCurrentCard] = useState(0);

  // Swipe handlers for Features carousel
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentCard((prev) => (prev + 1) % agents.length),
    onSwipedRight: () => setCurrentCard((prev) => (prev - 1 + agents.length) % agents.length),
    trackMouse: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % 3);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentCard * 300,
        behavior: "smooth"
      });
    }
  }, [currentCard]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/signin");
  };

  // Add useEffect to listen for Escape key to close modals
  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape") {
        setSelectedJob(null);
        setSelectedApplication(null);
      }
    }
    if (selectedJob || selectedApplication) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [selectedJob, selectedApplication]);


  if (!userId) return <div className="p-8">Please sign In.</div>;
  if (!user) return <div className="p-8">Sign-In or Sign-Up To View DashBoard!!...</div>;

return (
    <div
      className="min-h-screen p-6 space-y-8 text-gray-800 leading-relaxed tracking-wide"
      style={{ backgroundColor: '#FFFDF3' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
          Welcome Back, {user?.name?.split(" ")[0]}
          <span
            className="animate-wave inline-block origin-bottom"
            role="img"
            aria-label="waving hand"
          >
            👋
          </span>
        </h2>
      </div>

      {/* Suggested Jobs - moved to top and full width */}
      <div className="w-full">
        <div className="bg-[#FFFCF2] rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">💼 Suggested Jobs</h2>
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
              <p className="text-base text-green-600">Showing {suggestedJobs.length} suggested and {normalJobs.length} normal jobs</p>
              <ul className="max-h-[500px] overflow-y-auto space-y-3 text-base text-gray-700 list-none pl-0">
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
                      className={`transition hover:scale-[1.01] border border-gray-200 rounded-lg p-4 cursor-pointer text-base ${
                        job.matchScore >= 80
                          ? "bg-green-50 hover:border-indigo-400"
                          : job.matchScore >= 50
                          ? "bg-yellow-50 hover:border-indigo-400"
                          : "bg-red-50 hover:border-indigo-400"
                      }`}
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
                    className="transition hover:scale-[1.01] border border-gray-200 rounded-lg p-4 hover:border-indigo-400 cursor-pointer text-base"
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

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Application Tracker - animated and moved above agent cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#FFFCF2] p-4 rounded-xl"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">📊 Application Tracker</h2>
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
              {[...new Map(
                (user?.applications || [])
                  .filter(app => ['submitted', 'applied'].includes(app.status))
                  .map(app => [`${app.jobTitle}-${app.company}`, app])
              ).values()].map((app, idx) => (
                <tr
                  key={idx}
                  className="bg-white border-b cursor-pointer hover:bg-indigo-50"
                  onClick={() => setSelectedApplication(app)}
                >
                  <td className="px-4 py-2">{app.jobTitle || app.title}</td>
                  <td className="px-4 py-2">{app.company}</td>
                  <td className="px-4 py-2">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-green-600">
                    {app.status === 'in-progress' ? '⏳ In Progress' : '✅ Applied'}
                    <progress
                      value={app.status === 'in-progress' ? 50 : 100}
                      max="100"
                      className="w-full h-2 rounded bg-gray-200 text-green-600 mt-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Swipeable Agent Cards - improved Features section */}
      <div className="mb-6 w-full">
        <div className="bg-[#FFFCF2] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">✨ Key Features</h2>
            <div className="flex gap-2">
              <button
                className="text-gray-500 hover:text-indigo-600 transition"
                onClick={() => setCurrentCard((prev) => (prev - 1 + agents.length) % agents.length)}
              >
                ◀
              </button>
              <button
                className="text-gray-500 hover:text-indigo-600 transition"
                onClick={() => setCurrentCard((prev) => (prev + 1) % agents.length)}
              >
                ▶
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
              className="border rounded-lg p-6 bg-[#FFFAEE] w-full"
              {...swipeHandlers}
            >
              <h3 className="text-xl font-semibold mb-1">{agents[currentCard].icon} {agents[currentCard].title}</h3>
              <p className="text-sm text-indigo-700">{agents[currentCard].desc}</p>
              <TypingText text={agents[currentCard].description} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Platform Growth Stats */}
      <div className="bg-[#FFFCF2] p-4 mt-6 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex justify-center items-center gap-2">
          <div className="w-8 h-8">
            <Lottie animationData={rocketAnimation} loop autoplay />
          </div>
          Platform Growth
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: "Jobs Analyzed", end: 12000 },
            { label: "Resumes Scored", end: 3400 },
            { label: "Autofill Apps", end: 980 },
            { label: "Users Helped", end: 542 }
          ].map(({ label, end }) => (
            <div key={label}>
              <p className="text-4xl font-bold text-indigo-600">
                <CountUp
                  end={end}
                  duration={2.5}
                  easingFn={(t, b, c, d) => {
                    const ts = (t /= d) * t;
                    const tc = ts * t;
                    return b + c * (tc + -3 * ts + 3 * t);
                  }}
                />
              </p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Live Activity Feed (Dynamic Rotating) */}
      <div className="bg-[#FFFCF2] rounded-xl p-4">
        <LiveActivityFeed />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* User Testimonials - Animated Carousel */}
      <div className="bg-[#FFFCF2] p-4 mt-6 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">💬 What Users Say</h2>
        {/* Responsive grid of 2 testimonials at once */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.slice(activityIndex, activityIndex + 2).map((testimonial, idx) => (
            <div key={idx} className="bg-[#FEF8EC] rounded-lg p-4 border border-yellow-200 text-sm text-gray-700 flex flex-col items-center">
              <p className="mb-2 italic text-center">{testimonial.text}</p>
              <div className="flex gap-1 text-yellow-400 text-lg mb-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
                {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                  <span key={i}>☆</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary Stats */}
      <footer className="text-center text-sm text-gray-500 mt-10">
        🔢 3,421 users | 18,765 applications | 120,430 AI prompts generated
      </footer>
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
    {/* Modal for selected application in Application Tracker */}
    {selectedApplication && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-white max-w-2xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] relative">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
            onClick={() => setSelectedApplication(null)}
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold mb-2">{selectedApplication.jobTitle || selectedApplication.title}</h2>
          <p className="text-gray-700 mb-1"><strong>Company:</strong> {selectedApplication.company}</p>
          <p className="text-gray-700 mb-1"><strong>Location:</strong> {selectedApplication.location || "N/A"}</p>
          <p className="text-gray-700 mb-1"><strong>Date Applied:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-700 mb-1 whitespace-pre-line"><strong>Cover Letter:</strong><br />{selectedApplication.coverLetter || "N/A"}</p>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Answers</h3>
            {selectedApplication.answers && selectedApplication.answers.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {selectedApplication.answers.map((a, i) => (
                  <li key={i}>
                    <p><strong>Q{i + 1}:</strong> {a.question}</p>
                    <p><strong>A:</strong> {a.answer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No answers submitted.</p>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
// Live Activity Feed component (dynamic rotating messages)
function LiveActivityFeed() {
  const [activityIndex, setActivityIndex] = useState(0);
  const activities = [
    "🎉 Alice just applied to Google",
    "💼 John used Tailored Answer Agent for Amazon",
    "🚀 Raj scored his resume for Microsoft",
    "✍️ Emma generated a cover letter using AI",
    "📈 Priya saw a 50% increase in interview calls",
    "🔍 Aditya used JD Score Agent for a Meta role"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activities.length);
    }, 1000); // 1 second per activity (change as needed)
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">🔥 Live Activity</h2>
      <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full w-fit mx-auto text-sm">
        {activities[activityIndex]}
      </div>
    </div>
  );
}