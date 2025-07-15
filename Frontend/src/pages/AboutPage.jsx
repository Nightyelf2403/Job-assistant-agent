import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fffdeb] py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">About Job Assistant</h1>
        <p className="text-gray-700 mb-4 text-lg leading-relaxed">
          Job Assistant is your all-in-one AI-powered copilot for job applications. Whether you're a student, recent graduate, or working professional, our tools help streamline the application process and boost your chances of landing interviews.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">🚀 What We Do</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Analyze your resume and give instant feedback</li>
          <li>Score job descriptions based on your profile</li>
          <li>Auto-generate tailored answers to recruiter questions</li>
          <li>Help you track and manage your job applications</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">🔍 Why It Matters</h2>
        <p className="text-gray-700 mb-4">
          Navigating the job market can be overwhelming. We use AI to remove guesswork, save time, and increase your confidence while applying for roles that match your skills and goals.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">🙌 Our Mission</h2>
        <p className="text-gray-700">
          To empower job seekers with smart tools that make applying for jobs easier, faster, and more effective — no matter where you're starting from.
        </p>
        <div className="mt-10 border-t pt-6 text-gray-700">
          <h2 className="text-2xl font-semibold mb-2">📬 Contact & Issues</h2>
          <p className="mb-2">For support or questions, feel free to reach out:</p>
          <ul className="list-disc list-inside">
            <li>Email: <a href="mailto:adiaditya7907@gmail.com" className="text-blue-600 hover:underline">adiaditya7907@gmail.com</a></li>
            <li>GitHub: <a href="https://github.com/Nightyelf2403" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Nightyelf2403</a></li>
            <li>LinkedIn: <a href="https://www.linkedin.com/in/lalith-aditya-chunduri-76573421a/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lalith Aditya Chunduri</a></li>
          </ul>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-gray-600 italic">
          Created by <span className="font-semibold text-black">Lalith Aditya Chunduri</span> — with ❤️ and React.
        </div>
      </div>
    </div>
  );
}