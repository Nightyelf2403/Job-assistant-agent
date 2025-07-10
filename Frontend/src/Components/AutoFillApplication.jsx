import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function AutoFillApplication() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [questions, setQuestions] = useState([
    { question: "Why do you want to work here?", answer: "" },
    { question: "What attracts you to this role?", answer: "" },
    { question: "How does this align with your future goals?", answer: "" },
  ]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const res = await API.get(`/jobs/suggested-job/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error("❌ Failed to load job details:", err);
      }
    }
    fetchJobDetails();
  }, [jobId]);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].answer = value;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    // Will wire up backend logic later
    console.log("Submitting:", { jobId, questions, coverLetter });
  };

  if (!job) return <div className="p-4">Loading job description...</div>;

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Left: Job Description */}
      <div className="bg-white p-4 rounded shadow h-full overflow-auto">
        <h2 className="text-xl font-bold mb-2">{job.job_title}</h2>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {job.job_description || "No description provided."}
        </p>
      </div>

      {/* Right: Application Form */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold">Recruiter Questions</h3>
        {questions.map((q, index) => (
          <div key={index}>
            <label className="block font-medium text-sm mb-1">{q.question}</label>
            <textarea
              value={q.answer}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              className="w-full border rounded p-2 text-sm"
              rows={2}
            />
          </div>
        ))}

        {/* Custom question */}
        <div>
          <label className="block font-medium text-sm mb-1">Ask the AI a custom question</label>
          <input
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            placeholder="e.g. What technologies does the company use?"
          />
          {/* We can later wire this to AI */}
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block font-medium text-sm mb-1">Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            rows={6}
          />
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