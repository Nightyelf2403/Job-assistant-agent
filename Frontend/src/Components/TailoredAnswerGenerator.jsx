import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TailoredAnswerGenerator() {
  const [jobDescription, setJobDescription] = useState('');
  const [userProfile, setUserProfile] = useState({});
  const [answer, setAnswer] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [showFullResume, setShowFullResume] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Auto-fetch resumeText and profile on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const profileRes = await axios.get("http://localhost:5050/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resumeRes = await axios.get("http://localhost:5050/api/users/extract-resume", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserProfile(profileRes.data);
        setResumeText(resumeRes.data.resumeText || '');
      } catch (err) {
        console.error("Initial fetch failed:", err);
      }
    };

    fetchInitialData();
  }, []);

  const handleGenerate = async () => {
    try {
      const token = localStorage.getItem("token");
      const profileRes = await axios.get("http://localhost:5050/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resumeRes = await axios.get("http://localhost:5050/api/users/extract-resume", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await axios.post("http://localhost:5050/api/generate/answer", {
        jobDescription,
        userProfile: profileRes.data,
        resumeText: resumeRes.data.resumeText || ''
      });

      setUserProfile(profileRes.data);
      setResumeText(resumeRes.data.resumeText || '');
      setAnswer(response.data.answer);
    } catch (err) {
      console.error("Error generating answer:", err);
    }
  };

  const forceExtractResume = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5050/api/users/extract-resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResumeText(res.data.resumeText || '');
    } catch (err) {
      console.error("Resume extraction failed:", err);
    }
  };

  const handleCustomQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5050/api/generate/answer", {
        question: customQuestion,
        resumeText,
        jobDescription,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomAnswer(res.data.answer);
    } catch (err) {
      console.error("Failed to get AI response:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">🎯 Tailored Answer Generator</h2>

      <label className="block text-lg font-medium text-gray-700 mb-2">
        Job Description
      </label>
      <textarea
        placeholder="Paste Job Description here..."
        className="w-full h-40 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition-all"
      >
        Generate Answer
      </button>
      <button
        onClick={forceExtractResume}
        className="ml-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded transition-all"
      >
        Force Extract Resume
      </button>

      {answer && (
        <div className="mt-6 p-6 border border-gray-300 rounded-md bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">📝 Generated Answer</h3>
          <p className="text-gray-800 whitespace-pre-line">{answer}</p>
        </div>
      )}

      {resumeText && (
        <div className="mt-6 p-6 border border-gray-300 rounded-md bg-white shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">📄 Extracted Resume</h3>
          <button
            className="text-blue-600 underline mb-2"
            onClick={() => setShowFullResume(!showFullResume)}
          >
            {showFullResume ? 'Collapse' : 'Show Full Resume'}
          </button>
          <p className="text-gray-800 whitespace-pre-line">
            {showFullResume ? resumeText : resumeText.slice(0, 1000) + '...'}
          </p>
        </div>
      )}

      <div className="mt-10 p-6 border border-gray-300 rounded-md bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">🤖 Ask Custom Questions</h3>
        <textarea
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Ask something like: Why is this job a good fit for me?"
          className="w-full h-28 p-4 border border-gray-300 rounded-md mb-4"
        />
        <button
          onClick={handleCustomQuestion}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded"
        >
          Submit Question
        </button>
        {customAnswer && (
          <div className="mt-4">
            <h4 className="text-lg font-medium text-gray-700">AI Response:</h4>
            <p className="text-gray-800 whitespace-pre-line mt-2">{customAnswer}</p>
          </div>
        )}
      </div>
      <div className="mt-10 p-6 border border-gray-300 rounded-md bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">📬 AI-Generated Cover Letter</h3>
        <button
          onClick={async () => {
            try {
              const token = localStorage.getItem("token");
              const res = await axios.post("http://localhost:5050/api/tailored/cover-letter",  {
                resumeText,
                jobDescription
              }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              setCoverLetter(res.data.coverLetter);
            } catch (err) {
              console.error("Failed to generate cover letter:", err);
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
        >
          Generate Cover Letter
        </button>
        {coverLetter && (
          <div className="mt-4">
            <h4 className="text-lg font-medium text-gray-700">Cover Letter:</h4>
            <p className="text-gray-800 whitespace-pre-line mt-2">{coverLetter}</p>
          </div>
        )}
      </div>
    </div>
  );
}
