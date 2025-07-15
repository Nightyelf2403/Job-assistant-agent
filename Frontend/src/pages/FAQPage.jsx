import React, { useState } from "react";

export default function FAQPage() {
  const faqs = [
    { q: "What is Job Assistant?", a: "Job Assistant helps automate and optimize your job applications using AI." },
    { q: "Is it free to use?", a: "Yes, basic features are free. Premium features will be introduced soon." },
    { q: "How is my data handled?", a: "We do not share your data. Everything is securely stored and used only for your application assistance." },
    { q: "Can I delete my account?", a: "Yes, contact support and we’ll handle it within 24 hours." },
    { q: "Can I upload my resume as a PDF?", a: "Yes, you can upload your resume in PDF format. Our AI will automatically extract and analyze the content." },
    { q: "How do I use the Autofill Agent?", a: "After setting up your profile, go to any job and click 'Apply through Autofill' to let our AI auto-complete applications." },
    { q: "What is the Tailored Resume feature?", a: "This feature evaluates your resume against a job description and suggests improvements to increase your match score." },
    { q: "Where can I view my application progress?", a: "You can view your application status under the 'Applications' section on the dashboard." },
    { q: "Who developed Job Assistant?", a: "Job Assistant was developed by Lalith Aditya Chunduri to help job seekers streamline their applications using AI." }
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen bg-[#fffdeb] py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div key={i} className="border-b border-gray-200 pb-2">
              <button
                onClick={() => toggle(i)}
                className="w-full text-left text-lg font-medium text-gray-800 focus:outline-none transition-all duration-200"
              >
                {item.q}
              </button>
              <div
                className={`text-gray-700 mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="pt-2">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}