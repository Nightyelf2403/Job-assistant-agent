// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import TermsPage from './pages/TermsPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

import SignIn from './components/SignIn.jsx';
import SignUp from './Components/SignUp.jsx';
import MultiStepform from './Components/MultiStepform.jsx';
import ResumeMatchTool from './components/ResumeMatchTool.jsx';
import TailoredAnswerGenerator from './components/TailoredAnswerGenerator.jsx';
import JobTracker from './Components/JobTracker.jsx';
import AutoFillApplication from './Components/AutoFillApplication.jsx';
import TailoredResumePage from './pages/TailoredResumePage';



import Header from './Components/Header.jsx';
import Footer from './Components/Footer.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Profile Setup */}
          <Route path="/profile-setup" element={<MultiStepform />} />

          {/* Dashboard & Tools */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-score" element={<TailoredResumePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume-analyzer" element={<ResumeMatchTool />} />
          <Route path="/tailored-answer" element={<TailoredAnswerGenerator />} />
          <Route path="/job-tracker" element={<JobTracker />} />
          <Route path="/profile/edit" element={<MultiStepform isEditing={true} />} />
          <Route path="/autofill/:jobId" element={<AutoFillApplication />} /> 
          <Route path="/TailoredResumePage" element={<Navigate to="/resume-score" replace />} />
          <Route path="/Terms" element={<TermsPage />} />
          <Route path="/FAQ" element={<FAQPage />} />
          <Route path="/About" element={<AboutPage />} />

          
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
