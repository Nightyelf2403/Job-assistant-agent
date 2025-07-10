import React from "react";

export default function FAQPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold"> What is Job Assistant?</h2>
          <p className="text-gray-700">Job Assistant helps automate and optimize your job applications using AI.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> Is it free to use?</h2>
          <p className="text-gray-700">Yes, basic features are free. Premium features will be introduced soon.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> How is my data handled?</h2>
          <p className="text-gray-700">We do not share your data. Everything is securely stored and used only for your application assistance.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> Can I delete my account?</h2>
          <p className="text-gray-700">Yes, contact support and we’ll handle it within 24 hours.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> Can I upload my resume as a PDF?</h2>
          <p className="text-gray-700">Yes, you can upload your resume in PDF format. Our AI will automatically extract and analyze the content.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> How do I use the Autofill Agent?</h2>
          <p className="text-gray-700">After setting up your profile, go to any job and click 'Apply through Autofill' to let our AI auto-complete applications.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> What is the Tailored Resume feature?</h2>
          <p className="text-gray-700">This feature evaluates your resume against a job description and suggests improvements to increase your match score.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> Where can I view my application progress?</h2>
          <p className="text-gray-700">You can view your application status under the 'Applications' section on the dashboard.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold"> Who developed Job Assistant?</h2>
          <p className="text-gray-700">Job Assistant was developed by Lalith Aditya Chunduri to help job seekers streamline their applications using AI.</p>
        </div>
      </div>
    </div>
  );
}