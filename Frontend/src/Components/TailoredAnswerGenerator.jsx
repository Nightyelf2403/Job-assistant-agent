import React, { useState } from 'react';
import axios from 'axios';

export default function TailoredAnswerGenerator() {
  const [jobDescription, setJobDescription] = useState('');
  const [userProfile, setUserProfile] = useState({});
  const [answer, setAnswer] = useState('');

  const handleGenerate = async () => {
    try {
      const response = await axios.post('http://localhost:5050/api/generate/answer', {
        jobDescription,
        userProfile
      });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Generate Tailored Answer</h2>
      <textarea
        placeholder="Paste Job Description here..."
        className="w-full border p-2"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <button onClick={handleGenerate} className="bg-green-600 text-white px-4 py-2">Generate Answer</button>
      {answer && (
        <div className="mt-4 p-4 border bg-gray-100">
          <strong>Generated Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
