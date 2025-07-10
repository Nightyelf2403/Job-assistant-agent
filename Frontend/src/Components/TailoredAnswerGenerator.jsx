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

      {answer && (
        <div className="mt-6 p-6 border border-gray-300 rounded-md bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">📝 Generated Answer</h3>
          <p className="text-gray-800 whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}
