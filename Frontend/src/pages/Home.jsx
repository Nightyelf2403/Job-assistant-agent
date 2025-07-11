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
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="home-container bg-gray-50 text-gray-800">
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 text-center px-4" data-aos="fade-in" data-aos-delay="100">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg tracking-tight text-indigo-700" data-aos="fade-down" data-aos-delay="200">Welcome to Job Assistant</h1>
        <p className="text-xl text-gray-600 mb-6" data-aos="fade-up" data-aos-delay="400">Where AI helps you land your dream job effortlessly.</p>
        <p className="text-lg text-gray-600 animate-bounce animate-pulse mt-6" data-aos="fade-up" data-aos-delay="600">↓ Scroll to explore ↓</p>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-16" data-aos="fade-up">
        <section className="hero text-center" data-aos="fade-up">
        </section>

        <section className="features mt-16" data-aos="zoom-in-up">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center mb-8" data-aos="zoom-in">Smart Features</h2>
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
            <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition duration-500 ease-in-out hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100" data-aos="flip-left">
              <h3 className="text-lg font-bold mb-2">🔍 Resume Analyzer</h3>
              <p>Get real-time feedback on your resume and match score against job descriptions.</p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition duration-500 ease-in-out hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100" data-aos="flip-left" data-aos-delay="100">
              <h3 className="text-lg font-bold mb-2">💡 Tailored Answers</h3>
              <p>Generate professional answers to recruiter questions using your resume + JD.</p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition duration-500 ease-in-out hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100" data-aos="flip-left" data-aos-delay="200">
              <h3 className="text-lg font-bold mb-2">⚡ Autofill Agent</h3>
              <p>Automatically fill out job applications using saved profile info.</p>
            </div>
          </div>
        </section>

        <section className="how-it-works mt-20 text-center" data-aos="fade-left">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4" data-aos="zoom-in">How It Works</h2>
          <ol className="list-decimal list-inside space-y-4 text-left max-w-md mx-auto">
            <li data-aos="fade-up" data-aos-delay="100" className="transition duration-300 ease-in-out hover:translate-x-2">Upload your resume and profile</li>
            <li data-aos="fade-up" data-aos-delay="200" className="transition duration-300 ease-in-out hover:translate-x-2">Explore job suggestions</li>
            <li data-aos="fade-up" data-aos-delay="300" className="transition duration-300 ease-in-out hover:translate-x-2">Get tailored answers & apply with Autofill Agent</li>
            <li data-aos="fade-up" data-aos-delay="400" className="transition duration-300 ease-in-out hover:translate-x-2">Track your applications</li>
          </ol>
          <button
            onClick={handleGetStarted}
            className="mt-10 px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-lg font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-transform transform hover:scale-110 duration-300 animate-bounce"
            data-aos="zoom-in-up"
          >
            Get Started
          </button>
        </section>
      </div>
    </div>
  );
}
