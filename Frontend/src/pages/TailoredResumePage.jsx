import axios from 'axios';
import React, { useState, useEffect } from "react";
import "../styles/TailoredResumePage.css";

const TailoredResumePage = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [rawResumeText, setRawResumeText] = useState("");
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No auth token found.");
          return;
        }

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));
        const userId = decodedPayload.userId;

        // Helper to trigger resume extraction
        const triggerResumeExtraction = async () => {
          try {
            await axios.post(`http://localhost:5050/api/users/${userId}/extract-resume`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (err) {
            console.error("❌ Failed to trigger resume extraction:", err);
          }
        };

        const res = await axios.get(`http://localhost:5050/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const user = res.data;

        if (user.resumeText) {
          setRawResumeText(user.resumeText);
        } else {
          console.warn("No resumeText found, triggering extraction...");
          await triggerResumeExtraction();
          // Re-fetch user after extraction
          const recheck = await axios.get(`http://localhost:5050/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (recheck.data.resumeText) {
            setRawResumeText(recheck.data.resumeText);
          } else {
            setRawResumeText("Resume extraction failed or is still processing.");
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch or trigger resume extraction:", err);
      }
    };

    fetchResume();
  }, []);

  const handleFetchResumeText = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found.");
        return;
      }

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(window.atob(base64));
      const userId = decodedPayload.userId;

      const res = await axios.get(`http://localhost:5050/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const user = res.data;
      if (user.resumeText) setRawResumeText(user.resumeText);
      else setRawResumeText("No resume text found.");
    } catch (err) {
      console.error("❌ Failed to fetch resume text:", err);
      setRawResumeText("Error fetching resume text.");
    }
  };

  const [matchScore, setMatchScore] = useState(85);
  const [scoreReasons, setScoreReasons] = useState([
    "✅ Skills match: 5/6",
    "✅ Degree aligns with JD",
    "❌ Missing Google Ads certification"
  ]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleAskAI = async () => {
    if (!customQuestion || !rawResumeText || !jobDescription) return;

    try {
      const res = await axios.post('http://localhost:5050/api/tailored/ask', {
        resumeText: rawResumeText,
        jobDescription,
        question: customQuestion
      });
      setAiResponse(res.data.answer);
    } catch (err) {
      console.error("❌ Failed to get AI response:", err);
      setAiResponse("Failed to fetch AI response.");
    }
  };

  const evaluateScore = async () => {
    try {
      const res = await axios.post('http://localhost:5050/api/tailored/score', {
        resumeText: rawResumeText,
        jobDescription
      });
      setMatchScore(res.data.score);
      setScoreReasons(res.data.points);
    } catch (err) {
      console.error("❌ Failed to get match score:", err);
    }
  };

  return (
    <div className="resume-score-container">
      <h2>Tailored Resume & JD Match</h2>

      <div className="section">
        <h4>Job Description Input</h4>
        <textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onBlur={evaluateScore}
        ></textarea>
      </div>

      <div className="grid-section">
        <div className="resume-view">
          <h4>Extracted Resume View</h4>
          <button onClick={handleFetchResumeText} className="fetch-btn">
            Fetch Extracted Resume
          </button>
          <div className="raw-resume-text">
            {rawResumeText ? (
              <>
                <div className={`resume-text-container ${showFullText ? 'expanded' : 'collapsed'}`}>
                  <pre>{showFullText ? rawResumeText : rawResumeText.slice(0, 1000) + "..."}</pre>
                </div>
                <button onClick={() => setShowFullText(!showFullText)} className="toggle-btn">
                  {showFullText ? "Show Less" : "Show More"}
                </button>
              </>
            ) : (
              <p>No extracted resume text available.</p>
            )}
          </div>
        </div>

        <div className="score-answer-section">
          <div className="score-box">
            <h4>Resume Match Score</h4>
            <div className="score-circle">{matchScore}/100</div>
            <ul>
              {scoreReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="ai-question-box">
            <h4>Ask AI a Question</h4>
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Type your recruiter question here..."
            />
            <button onClick={handleAskAI}>Ask AI</button>
            {aiResponse && (
              <div className="ai-answer">
                <p>{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailoredResumePage;