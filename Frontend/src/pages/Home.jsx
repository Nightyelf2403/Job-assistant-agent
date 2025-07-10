import "../styles/Home.css"; 
import React from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  const navigate = useNavigate();

  React.useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="home-container bg-gray-50 text-gray-800">
      <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-center px-4" data-aos="fade-in">
        <h1 className="text-5xl font-bold mb-4">Welcome to Job Assistant</h1>
        <p className="text-xl text-gray-600 mb-6">Where AI helps you land your dream job effortlessly.</p>
        <p className="text-lg text-gray-600 animate-bounce mt-6">↓ Scroll to explore ↓</p>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-16" data-aos="fade-up">
        <section className="hero text-center" data-aos="fade-up">
        </section>

        <section className="features mt-16" data-aos="zoom-in-up">
          <h2 className="text-2xl font-semibold text-center mb-8">Smart Features</h2>
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
            <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition" data-aos="flip-left">
              <h3 className="text-lg font-bold mb-2">🔍 Resume Analyzer</h3>
              <p>Get real-time feedback on your resume and match score against job descriptions.</p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition" data-aos="flip-left" data-aos-delay="100">
              <h3 className="text-lg font-bold mb-2">💡 Tailored Answers</h3>
              <p>Generate professional answers to recruiter questions using your resume + JD.</p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition" data-aos="flip-left" data-aos-delay="200">
              <h3 className="text-lg font-bold mb-2">⚡ Autofill Agent</h3>
              <p>Automatically fill out job applications using saved profile info.</p>
            </div>
          </div>
        </section>

        <section className="how-it-works mt-20 text-center" data-aos="fade-left">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-left max-w-md mx-auto">
            <li>Upload your resume and profile</li>
            <li>Explore job suggestions</li>
            <li>Get tailored answers & apply with Autofill Agent</li>
            <li>Track your applications</li>
          </ol>
          <button
            onClick={handleGetStarted}
            className="mt-8 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
        </section>
      </div>
    </div>
  );
}
