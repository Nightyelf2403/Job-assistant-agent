import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import "../styles/AutoFillApplication.css";

export default function AutoFillApplication() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/jobs/details/${jobId}`);
        setJob(res.data.job);
      } catch (err) {
        setStatus((prev) => ({ ...prev, error: "Failed to load job" }));
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", answer: "" }]);
  };

  const handleGenerateAnswers = async () => {
    try {
      setStatus({ loading: true, error: "", success: "" });
      const res = await API.post("/generate/answer", { questions });
      const formatted = questions.map((q, i) => ({
        question: q.question,
        answer: res.data.answers[i] || "",
      }));
      setQuestions(formatted);
      setStatus({ loading: false, success: "Answers generated" });
    } catch (err) {
      setStatus({ loading: false, error: "AI answer generation failed" });
    }
  };

  const handleSubmit = async () => {
    try {
      setStatus({ loading: true, error: "", success: "" });
      const userId = localStorage.getItem("userId");
      await API.post(`/applications/autofill/${userId}`, {
        jobId,
        questions,
      });
      setStatus({ loading: false, success: "Application submitted successfully" });
    } catch (err) {
      setStatus({ loading: false, error: "Submission failed" });
    }
  };

  return (
    <div className="auto-application-container">
      {status.loading && <p className="text-blue-600 mb-4">Loading...</p>}
      <h2 className="text-2xl font-bold mb-4">Autofill Application</h2>

      {job && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company} – {job.location}</p>
          <p className="mt-2">{job.description}</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold">Recruiter Questions</h4>
        {questions.map((qa, idx) => (
          <div key={idx} className="border p-4 rounded space-y-2">
            <input
              type="text"
              placeholder="Question"
              value={qa.question}
              onChange={(e) => handleChange(idx, "question", e.target.value)}
              className="w-full px-3 py-2 border"
            />
            <textarea
              placeholder="Answer (optional, can use AI)"
              value={qa.answer}
              onChange={(e) => handleChange(idx, "answer", e.target.value)}
              className="w-full px-3 py-2 border"
            />
          </div>
        ))}
        <button
          onClick={handleAddQuestion}
          className="text-blue-600 hover:underline text-sm"
        >
          + Add another question
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm mb-4">
        <p><strong>Using your profile data:</strong> name, email, phone, skills...</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleGenerateAnswers}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          disabled={status.loading}
        >
          Generate Answers with AI
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={status.loading}
        >
          Submit Application
        </button>
      </div>

      {status.error && <p className="text-red-500 mt-4">{status.error}</p>}
      {status.success && <p className="text-green-600 mt-4">{status.success}</p>}
      {status.success && (
        <button
          className="mt-4 px-4 py-2 text-indigo-600 underline"
          onClick={() => window.location.href = "/dashboard"}
        >
          ← Back to Dashboard
        </button>
      )}
    </div>
  );
}