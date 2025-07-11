import React from 'react';

export default function TermsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>

      <p className="mb-4">
        Welcome to our Job Application Assistant (“the Service”). By using this Service, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing or using the Service, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, you must not access or use the Service.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. Use of the Service</h2>
      <ul className="list-disc list-inside mb-4">
        <li>You may use the Service only for lawful purposes and in accordance with these Terms.</li>
        <li>You are responsible for the accuracy of information you provide, including resume data and job preferences.</li>
        <li>You must not misuse our Service to spam, hack, or distribute malicious content.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. User Accounts</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. We are not liable for any loss or damage arising from your failure to protect your credentials.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. AI-Generated Content</h2>
      <p className="mb-4">
        The Service uses AI to generate answers, suggestions, and analysis based on the data you provide. While we aim to provide helpful content, we do not guarantee accuracy or suitability for any purpose. You use AI-generated output at your own risk.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Intellectual Property</h2>
      <p className="mb-4">
        All content, branding, and functionality are the property of the Service and may not be used without permission. User-uploaded resumes and job descriptions remain the intellectual property of the user.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate your access to the Service at any time, without prior notice, if we believe you have violated these Terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Modifications</h2>
      <p className="mb-4">
        We may update these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of those changes.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">8. Contact Us</h2>
      <p className="mb-4">
        If you have questions about these Terms and Conditions, please contact us at <a className="text-blue-600 underline" href="mailto:support@jobassistant.ai">support@jobassistant.ai</a>.
      </p>

      <p className="text-sm text-gray-500 mt-8">Last updated: July 11, 2025</p>
    </div>
  );
}
