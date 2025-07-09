import "../styles/Home.css"; 

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Welcome to Job Assistant
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
          Where AI helps you land your dream jobs. Discover tailored job suggestions,
          resume improvements, and intelligent application support.
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition"
        >
          Get Started
        </button>
      </main>
    </div>
  );
}
