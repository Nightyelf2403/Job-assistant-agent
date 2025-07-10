import axios from 'axios';
import React, { useState, useEffect } from "react";
import "../styles/TailoredResumePage.css";

const TailoredResumePage = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get('http://localhost:5050/api/users/me'); // adjust URL if needed
        const user = res.data;
        const formatted = {
          name: user.name,
          email: user.email,
          workHistory: user.experience || [],
          education: user.education || 'Not specified',
          university: user.college || 'Not specified',
          year: user.gradYear || ''
        };
        setResumeData(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch resume data:", err);
      }
    };

    fetchResume();
  }, []);

  const [matchScore, setMatchScore] = useState(85);
  const [scoreReasons, setScoreReasons] = useState([
    "✅ Skills match: 5/6",
    "✅ Degree aligns with JD",
    "❌ Missing Google Ads certification"
  ]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleAskAI = async () => {
    if (!customQuestion || !resumeData || !jobDescription) return;

    try {
      const res = await axios.post('http://localhost:5050/api/tailored/ask', {
        resumeText: JSON.stringify(resumeData),
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
        resumeText: JSON.stringify(resumeData),
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
          {resumeData && (
            <div className="resume-card">
              <b>{resumeData.name}</b>
              <p><b>Contact</b><br />{resumeData.name}</p>
              <p><b>Email</b><br />{resumeData.email}</p>
              <p><b>Work History</b><br />{resumeData.workHistory[0]?.role} <span>{resumeData.workHistory[0]?.years}</span><br />{resumeData.workHistory[0]?.desc}</p>
              <p><b>Education</b><br />{resumeData.education} - {resumeData.university}, {resumeData.year}</p>
            </div>
          )}
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