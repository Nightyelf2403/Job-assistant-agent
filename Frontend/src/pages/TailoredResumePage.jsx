import axios from 'axios';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "../styles/TailoredResumePage.css";

const TailoredResumePage = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [rawResumeText, setRawResumeText] = useState("");
  const [showFullText, setShowFullText] = useState(false);

  const [isResumeModalOpen, setResumeModalOpen] = useState(false);

  const closeModalOnEsc = (e) => {
    if (e.key === "Escape") {
      setResumeModalOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", closeModalOnEsc);
    return () => window.removeEventListener("keydown", closeModalOnEsc);
  }, []);

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
            setRawResumeText("Resume extraction failed or is still processing. If you Didn't Uploaded Resume Please Upload It.");
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
  const [displayedResponse, setDisplayedResponse] = useState("");

useEffect(() => {
  let i = 0;
  setDisplayedResponse(""); // Reset before starting
  const interval = setInterval(() => {
    setDisplayedResponse((prev) => aiResponse.slice(0, i));
    if (i >= aiResponse.length) clearInterval(interval);
    i++;
  }, 20);
  return () => clearInterval(interval);
}, [aiResponse]);

  const handleAskAI = async () => {
    if (!customQuestion) {
      alert("Please type a question.");
      return;
    }
    if (!jobDescription) {
      alert("Please paste the job description first.");
      return;
    }
    if (!rawResumeText) {
      alert("Resume text not found. Please upload your resume.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found.");
        return;
      }

      const res = await axios.post('http://localhost:5050/api/generate/ask', {
        resumeText: rawResumeText,
        jobDescription,
        question: customQuestion
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAiResponse(res.data.answer);
    } catch (err) {
      console.error("❌ Failed to get AI response:", err);
      setAiResponse("Failed to fetch AI response.");
    }
  };

  const evaluateScore = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No auth token found in localStorage.");
      return;
    }

    console.log("📨 Sending match score request...");
    console.log("🔑 Token:", token);
    console.log("📝 Resume Text:", rawResumeText.slice(0, 5000) + "...");
    console.log("📄 Job Description:", jobDescription.slice(0, 5000) + "...");

    try {
      const res = await axios.post('http://localhost:5050/api/generate/score', {
        resumeText: rawResumeText,
        jobDescription
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("✅ Match score response:", res.data);
      setMatchScore(res.data.score);
      setScoreReasons(res.data.points);

      if (res.data.insights) {
        setScoreReasons(prev => [...prev, ...res.data.insights.map(insight => `💡 ${insight}`)]);
      }
      if (res.data.missingSkills && res.data.missingSkills.length > 0) {
        setScoreReasons(prev => [...prev, `🚫 Missing Skills: ${res.data.missingSkills.join(", ")}`]);
      }
      if (res.data.reasoning) {
        setScoreReasons(prev => [...prev, `🧠 Explanation: ${res.data.reasoning}`]);
      }

      // Optional: trigger confetti if score > 80
      // if (res.data.score > 80) {
      //   import('canvas-confetti').then(({ default: confetti }) => {
      //     confetti();
      //   });
      // }
    } catch (err) {
      console.error("❌ Failed to get match score:", err.response?.data || err.message);
    }
  };

  return (
    <motion.div
      className="resume-score-container"
      style={{
        backgroundColor: '#fffdf5',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
        margin: '2rem auto',
        maxWidth: '1200px'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2>JD Match</h2>

      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section" style={{marginTop: '1rem', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h4>Job Description Input</h4>
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #00c6ff'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
            style={{width: '100%', minHeight: '120px', borderRadius: '6px', border: '1px solid #ccc', padding: '0.5rem', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical'}}
          ></textarea>
          <button onClick={evaluateScore} className="primary-btn" style={{marginTop: '1rem'}}>Get Match Score</button>
        </div>
      </motion.div>

      <div className="grid-section" style={{display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'space-between'}}>
        <motion.div
          className="resume-view"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{flex: '1 1 45%', minWidth: '300px', backgroundColor: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
        >
          <h4>Extracted Resume View</h4>
          <button onClick={handleFetchResumeText} className="secondary-btn" style={{marginTop: '0.5rem', marginBottom: '1rem'}}>
            Fetch Extracted Resume
          </button>
          <div className="raw-resume-text" onClick={() => setResumeModalOpen(true)} style={{cursor: 'pointer'}}>
            {rawResumeText ? (
              <>
                <div className={`resume-text-container ${showFullText ? 'expanded' : 'collapsed'}`}>
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      lineHeight: '1.5',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      padding: '1rem',
                      backgroundColor: '#fcfcfc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      maxHeight: showFullText ? 'none' : '300px',
                      overflowY: 'auto'
                    }}
                  >
                    {showFullText ? rawResumeText : rawResumeText.slice(0, 1000) + "..."}
                  </pre>
                </div>
                <button onClick={() => setShowFullText(!showFullText)} className="toggle-btn" style={{marginTop: '1rem'}}>
                  {showFullText ? "Show Less" : "Show More"}
                </button>
              </>
            ) : (
              <p>No extracted resume text available.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          className="score-box"
          key={matchScore}
          style={{
            backgroundColor: '#eef5ff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            minWidth: '260px'
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h4>Resume Match Score</h4>
          <div style={{ width: 100, height: 100, marginBottom: "1rem" }}>
            <CircularProgressbar
              value={matchScore}
              text={`${matchScore}/100`}
              styles={buildStyles({
                textSize: "16px",
                pathColor: `#00c6ff`,
                textColor: "#005bea",
                trailColor: "#d6d6d6",
                backgroundColor: "#f8f9fa"
              })}
            />
          </div>
          <ul style={{marginTop: '1rem'}}>
            {scoreReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="ai-question-box"
          style={{
            backgroundColor: '#fff4f5',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            flex: '1 1 40%',
            minWidth: '280px'
          }}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h4>Ask AI a Question</h4>
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Type your recruiter question here..."
            style={{width: '100%', padding: '0.5rem', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '0.5rem'}}
          />
          <button onClick={handleAskAI} style={{marginTop: '1rem'}}>Ask AI</button>
          {aiResponse && (
            <motion.div
              className="ai-answer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{marginTop: '1rem'}}
            >
              <p>{displayedResponse}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {isResumeModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setResumeModalOpen(false)}>
          <motion.div
            className="modal-content"
            initial={{ y: "-100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              maxWidth: '80%',
              width: '800px',
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1rem', fontWeight: '600' }}>Extracted Resume</h2>
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>{rawResumeText}</pre>
            <button className="close-btn" style={{ marginTop: '1rem', padding: '8px 16px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }} onClick={() => setResumeModalOpen(false)}>
              Close
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default TailoredResumePage;