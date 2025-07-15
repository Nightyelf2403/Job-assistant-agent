import "../styles/Home.css"; 
import React from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Typewriter from "typewriter-effect";
import Lottie from 'lottie-react';
import robotAnimation from '../assets/robot-thinking.json'; // Ensure the JSON is placed in this path

export default function Home() {
  const navigate = useNavigate();
  const [currentFactIndex, setCurrentFactIndex] = React.useState(0);

  const facts = [
    "Tailoring your resume for each job posting increases your callback rate by over 30%!",
    "Using keywords from the job description can improve your resume's chances of getting noticed.",
    "Following up after an application can increase your chances of landing an interview.",
    "Customizing your cover letter shows employers your genuine interest in the role.",
    "Networking can often open doors to unadvertised job opportunities."
  ];

  React.useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prevIndex) => (prevIndex + 1) % facts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [facts.length]);

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

        <div className="text-xl text-gray-600 mb-6 min-h-[40px]" data-aos="fade-up" data-aos-delay="300">
          <Typewriter
            options={{
              strings: [
                "Where AI helps you land your dream job effortlessly.",
                "Smart. Fast. Personalized.",
                "Your career assistant, 24/7."
              ],
              autoStart: true,
              loop: true,
              delay: 50,
              deleteSpeed: 30,
            }}
          />
        </div>

        <div className="lottie-hero-animation w-48 h-48 mb-6" data-aos="zoom-in" data-aos-delay="400">
          {/* Placeholder for Lottie animation */}
        </div>

        <p className="text-lg text-gray-600 animate-bounce animate-pulse mt-6" data-aos="fade-up" data-aos-delay="600">↓ Scroll to explore ↓</p>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-16" data-aos="fade-up">
        {/* Stats Section */}
        <section className="stats grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center mb-16" data-aos="fade-up" data-aos-delay="100">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-500">
            <p className="text-4xl font-extrabold text-indigo-600 animate-countup">1,245</p>
            <p className="mt-2 text-lg font-semibold text-gray-700">Applications Submitted</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-500">
            <p className="text-4xl font-extrabold text-purple-600 animate-countup">3,872</p>
            <p className="mt-2 text-lg font-semibold text-gray-700">Resumes Scored</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-500">
            <p className="text-4xl font-extrabold text-pink-600 animate-countup">2,019</p>
            <p className="mt-2 text-lg font-semibold text-gray-700">Jobs Matched</p>
          </div>
        </section>

        <section className="hero text-center" data-aos="fade-up">
        </section>

        <div className="features mt-16" data-aos="zoom-in-up">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center mb-8" data-aos="zoom-in">Smart Features</h2>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="w-full lg:w-1/3 flex justify-center animate__animated animate__fadeInLeft" data-aos="zoom-in-up">
              <div className="w-80 h-80 sm:w-96 sm:h-96">
                <Lottie animationData={robotAnimation} loop={true} />
              </div>
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 w-full lg:w-2/3">
              <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition duration-500 ease-in-out hover:bg-opacity-80 hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 flex items-start space-x-4 hover:translate-y-[-4px] hover:rotate-1" data-aos="flip-left">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl">🔍</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Resume Analyzer</h3>
                  <p>Get real-time feedback on your resume and match score against job descriptions.</p>
                </div>
              </div>
              <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition duration-500 ease-in-out hover:bg-opacity-80 hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 flex items-start space-x-4 hover:translate-y-[-4px] hover:rotate-1" data-aos="flip-left" data-aos-delay="100">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl">💡</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Tailored Answers</h3>
                  <p>Generate professional answers to recruiter questions using your resume + JD.</p>
                </div>
              </div>
              <div className="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-2xl hover:scale-105 transform transition duration-500 ease-in-out hover:bg-opacity-80 hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 flex items-start space-x-4 hover:translate-y-[-4px] hover:rotate-1" data-aos="flip-left" data-aos-delay="200">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white text-2xl">⚡</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Autofill Agent</h3>
                  <p>Automatically fill out job applications using saved profile info.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="how-it-works mt-20 text-center" data-aos="fade-left">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-8" data-aos="zoom-in">How It Works</h2>
          <div className="flex flex-wrap items-center justify-center space-x-0 sm:space-x-4 space-y-4 sm:space-y-0 max-w-4xl mx-auto text-left">
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 rounded-full bg-indigo-500 text-white font-semibold shadow-md">Upload</div>
              <div className="text-indigo-500 font-bold text-xl select-none">→</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 rounded-full bg-purple-500 text-white font-semibold shadow-md">Explore Jobs</div>
              <div className="text-purple-500 font-bold text-xl select-none">→</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 rounded-full bg-pink-500 text-white font-semibold shadow-md">Get Answers</div>
              <div className="text-pink-500 font-bold text-xl select-none">→</div>
            </div>
            <div>
              <div className="px-4 py-2 rounded-full bg-indigo-500 text-white font-semibold shadow-md">Apply</div>
            </div>
          </div>
          <button
            onClick={handleGetStarted}
            className="mt-10 px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-lg font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-transform transform hover:scale-110 duration-300 animate-bounce"
            data-aos="zoom-in-up"
          >
            Get Started
          </button>
        </section>

        <section className="testimonials mt-32 mb-16 max-w-4xl mx-auto px-4" data-aos="fade-up" data-aos-delay="200">
          <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-12" data-aos="zoom-in">Testimonials</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-500">
              <p className="text-gray-700 italic">"JobAssist helped me land 3 interviews in a week!"</p>
              <p className="mt-4 font-semibold text-indigo-600">- Alex P.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-500">
              <p className="text-gray-700 italic">"The tailored answers saved me hours."</p>
              <p className="mt-4 font-semibold text-purple-600">- Jamie L.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-500">
              <p className="text-gray-700 italic">"Autofill Agent is a game changer."</p>
              <p className="mt-4 font-semibold text-pink-600">- Morgan S.</p>
            </div>
          </div>
        </section>

        <section className="did-you-know" data-aos="fade-up" data-aos-delay="100">
          <div className="did-you-know-title">💡 Did You Know?</div>
          <div className="did-you-know-text">
            <div
              key={currentFactIndex}
              className="transition-opacity duration-500 ease-in-out opacity-100"
            >
              {facts[currentFactIndex]}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
