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
        const res = await API.get(`/jobs/details/${jobId}`);
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
                      href={news.link || news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
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