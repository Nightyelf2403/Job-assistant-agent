import React, { useEffect, useState, useRef } from "react";
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
  const [showProfile, setShowProfile] = useState(false);
  const [showInfo, setShowInfo] = useState({});
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [lastFetchedTime, setLastFetchedTime] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const profileRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }

    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

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

  async function fetchJobs() {
    setLoadingJobs(true);
    try {
      const res = await API.get(`/jobs/suggested/${userId}`);
      console.log("⏱️ Time since last fetch:", Date.now() - lastFetchedTime, "ms");
      const jobs = res.data.suggestedJobs || [];
      console.log("📥 Received suggestedJobs from API:", jobs);
      if (jobs.length === 0) {
        console.warn("⚠️ No jobs returned from backend");
      }
      setSuggestedJobs(jobs);
      const now = Date.now();
      setLastFetchedTime(now);
      localStorage.setItem("cachedSuggestedJobs", JSON.stringify(jobs));
      localStorage.setItem("cachedSuggestedJobsTime", now.toString());
    } catch (err) {
      console.error("❌ Failed to fetch suggested jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }
  useEffect(() => {
    const cached = localStorage.getItem("cachedSuggestedJobs");
    const cachedTime = localStorage.getItem("cachedSuggestedJobsTime");

    if (cached && cachedTime && JSON.parse(cached).length > 0) {
      setSuggestedJobs(JSON.parse(cached));
      setLastFetchedTime(parseInt(cachedTime));
    } else {
      fetchJobs();
    }
  }, []);

  const toggleLearnMore = (agent) => {
    setShowInfo((prev) => ({ ...prev, [agent]: !prev[agent] }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/signin");
  };

  if (!user) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Profile Panel */}
      {showProfile && (
        <div ref={profileRef} className="bg-white rounded shadow p-4 w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-black" />
            <div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <p><strong>Location:</strong> {user.currentLocation || "N/A"}</p>
            <p><strong>Preferred Locations:</strong> {user.preferredLocations?.join(", ") || "N/A"}</p>
            <p><strong>Job Type:</strong> {user.jobType || "N/A"}</p>
            <p><strong>Desired Position:</strong> {user.desiredPosition || "N/A"}</p>
            <p><strong>Work Preference:</strong> {Array.isArray(user.workPreference) ? user.workPreference.join(", ") : "N/A"}</p>
            <p><strong>Skills:</strong> {user.skills?.join(", ") || "N/A"}</p>
          </div>
          <button
            onClick={() => {
              setShowProfile(false);
              navigate("/profile/edit");
            }}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* Agent Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">🧠 Autofill Agent</h3>
          <button className="mt-2 text-blue-600" onClick={() => toggleLearnMore("autofill")}>Learn more</button>
          {showInfo.autofill && (
            <TypingText text="Automatically fills application forms using your saved details." />
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">📊 Resume-to-JD Score Agent</h3>
          <button className="mt-2 text-blue-600" onClick={() => toggleLearnMore("score")}>Learn more</button>
          {showInfo.score && (
            <TypingText text="Compares your resume against job descriptions for match quality." />
          )}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">📝 Tailored Answer Agent</h3>
          <button className="mt-2 text-blue-600" onClick={() => toggleLearnMore("answer")}>Learn more</button>
          {showInfo.answer && (
            <TypingText text="Creates personalized responses for job application questions." />
          )}
        </div>
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
                <tr className="bg-white border-b">
                  <td className="px-4 py-2">Software Intern</td>
                  <td className="px-4 py-2">Google</td>
                  <td className="px-4 py-2">2025-07-01</td>
                  <td className="px-4 py-2 text-green-600">✅ Applied</td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-4 py-2">ML Intern</td>
                  <td className="px-4 py-2">Meta</td>
                  <td className="px-4 py-2">2025-07-02</td>
                  <td className="px-4 py-2 text-yellow-600">⏳ Awaiting</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-2">Frontend Developer</td>
                  <td className="px-4 py-2">Amazon</td>
                  <td className="px-4 py-2">2025-07-03</td>
                  <td className="px-4 py-2 text-red-600">❌ Rejected</td>
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
                const now = Date.now();
                if (lastFetchedTime && Date.now() - lastFetchedTime < 3 * 60 * 1000) {
                  alert("⏳ Reaching AI limit. Please wait 3 minutes before trying again.");
                  return;
                }
                fetchJobs();
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              🔄 Refresh
            </button>
          </div>
          {suggestedJobs.length > 0 ? (
            loadingJobs ? (
              <p className="text-gray-500">Loading new suggestions...</p>
            ) : (
              <ul className="space-y-3 text-sm text-gray-700">
                {suggestedJobs.map((job, index) => {
                  const company = job.employer_name || job.company_name || job.Company || "Unknown Company";
                  const location =
                    job.job_location ||
                    job.job_city ||
                    job.job_country ||
                    (job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : "") ||
                    job.Location ||
                    "Unknown Location";

                  return (
                    <li key={index} className="p-3 border rounded hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg">{job.job_title || job.JobTitle}</p>
                          <p className="text-sm text-gray-600">{company}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {location}
                        </div>
                      </div>
                      <p className="text-xs mt-1 text-gray-500">
                        🎯 Match Score: {job.matchScore || "N/A"} <br />
                        💡 Reason: {job.reason || "Not specified"}
                      </p>
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
                  );
                })}
              </ul>
            )
          ) : (
            loadingJobs ? (
              <p className="text-gray-500">Loading new suggestions...</p>
            ) : (
              <p>No job suggestions yet.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}