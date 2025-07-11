// src/Components/SuggestedJobDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/SuggestedJobDetail.css";

export default function SuggestedJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  const [recruiterAnswers, setRecruiterAnswers] = useState([]);

  const fetchRecruiterQuestions = async () => {
    try {
      const res = await API.post("/ai/answer-recruiter-questions", {
        userId,
        jobId: id,
        resumeText: job?.resumeText || "",
        jobDescription: job?.description || "",
      });
      setRecruiterAnswers(res.data.answers);
    } catch (err) {
      alert("❌ Failed to generate recruiter questions.");
    }
  };

  const handleAnswerChange = (index, newAnswer) => {
    const updated = [...recruiterAnswers];
    updated[index].answer = newAnswer;
    setRecruiterAnswers(updated);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/jobs/apply/autofill", {
        userId,
        jobId: id,
        answers: recruiterAnswers,
      });
      alert("✅ Application submitted with answers!");
      navigate("/dashboard");
    } catch (err) {
      alert("❌ Submission failed. Try again.");
    }
  };

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await API.get(`/jobs/detail/${id}`);
        setJob(res.data);
      } catch (err) {
        setError("Failed to load job details.");
      }
    }
    fetchJob();
  }, [id]);

  const handleAutofillApply = async () => {
    try {
      const res = await API.post("/jobs/apply/autofill", {
        userId,
        jobId: id
      });
      alert("✅ Application submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(
        err.response?.data?.error || "❌ Failed to apply via Autofill. Try again."
      );
    }
  };

  if (error) return <div className="error-msg">{error}</div>;
  if (!job) return <div className="loading">Loading job...</div>;

  return (
    <div
      className="job-detail-overlay"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Escape") navigate("/dashboard");
      }}
    >
      <div className="job-detail-modal">
        <button className="close-button" onClick={() => navigate("/dashboard")}>×</button>
        <div className="suggested-job-root">
          <div className="job-detail-container">
            <div className="job-header">
              <h2 className="text-2xl font-semibold">{job.title}</h2>
              <p className="text-gray-600">{job.company} — {job.location}</p>
            </div>

            <div className="apply-actions my-4 space-x-4">
              <button onClick={handleAutofillApply} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Apply via Autofill
              </button>
              <a
                href={job.url || job.apply_link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
              >
                Apply Externally ↗
              </a>
            </div>

            <div className="job-description mt-6">
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <div
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: (job.description || "No description provided.")
                    .replace(/\n/g, "<br/>")
                    .replace(/•/g, "<br/>•")
                    .replace(/Job Summary:?/gi, "<h4 class='font-bold mt-4'>Job Summary</h4>")
                    .replace(/Responsibilities:?/gi, "<h4 class='font-bold mt-4'>Responsibilities</h4>")
                    .replace(/Qualifications:?/gi, "<h4 class='font-bold mt-4'>Qualifications</h4>")
                    .replace(/Certifications Required:?/gi, "<h4 class='font-bold mt-4'>Certifications Required</h4>")
                    .replace(/Benefits:?/gi, "<h4 class='font-bold mt-4'>Benefits</h4>")
                }}
              />
              {!job.coverLetterGenerated && (
                <button
                  onClick={fetchRecruiterQuestions}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Generate Cover Letter
                </button>
              )}
            </div>

            <div className="job-meta mt-6 text-sm text-gray-500">
              <p><strong>Suggested by AI:</strong> {job.isAI ? "Yes" : "No"}</p>
              <p><strong>Job ID:</strong> {job.job_id || job.id}</p>
            </div>

            {job.isAI && (
              <div className="recruiter-questions mt-8">
                <h3 className="text-lg font-semibold mb-2">Recruiter Questions (AI Autofill)</h3>
                {recruiterAnswers.length === 0 ? (
                  <button
                    onClick={fetchRecruiterQuestions}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Generate Answers with AI
                  </button>
                ) : (
                  <form onSubmit={handleSubmitApplication}>
                    {recruiterAnswers.map((qa, idx) => (
                      <div key={idx} className="mb-4">
                        <label className="block font-medium mb-1">{qa.question}</label>
                        <textarea
                          value={qa.answer}
                          onChange={(e) =>
                            handleAnswerChange(idx, e.target.value)
                          }
                          className="w-full border p-2 rounded"
                          rows={3}
                          required
                        />
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Submit Application with Answers
                    </button>
                  </form>
                )}
                {recruiterAnswers.length > 0 ? null : (
                  <button
                    onClick={fetchRecruiterQuestions}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Generate Recruiter Answers
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

  useEffect(() => {
    if (job && recruiterAnswers.length === 0) {
      fetchRecruiterQuestions();
    }
  }, [job]);