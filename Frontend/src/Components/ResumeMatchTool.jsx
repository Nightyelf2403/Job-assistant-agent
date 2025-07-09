import React, { useState } from 'react';
import axios from 'axios';

export default function ResumeMatchTool() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axios.post('http://localhost:5050/api/resume/analyze', formData);
      setResult(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Resume to JD Match</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <textarea
        placeholder="Paste Job Description here..."
        className="w-full border p-2"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2">Analyze</button>
      {result && (
        <div className="mt-4">
          <p>Score: {result.matchScore}</p>
          <ul>
            {result.insights.map((i, idx) => <li key={idx}>• {i}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
