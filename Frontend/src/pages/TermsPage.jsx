import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="mb-4">
        Welcome to Job Assistant Agent! These terms and conditions outline the
        rules and regulations for the use of our platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing this platform, you accept these terms and conditions. If you
        disagree with any part, you may not use our services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. User Responsibilities</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>You must provide accurate and truthful information.</li>
        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
        <li>You agree not to use the platform for any unlawful or prohibited activities.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Intellectual Property</h2>
      <p className="mb-4">
        All content, trademarks, and data on this platform, including software,
        databases, and text, are the property of Job Assistant Agent or its
        licensors.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Termination</h2>
      <p className="mb-4">
        We may terminate or suspend your access to our services immediately,
        without prior notice or liability, for any reason, including if you breach
        the terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
      <p className="mb-4">
        We reserve the right to modify these terms at any time. Continued use of
        the platform after changes constitutes acceptance of the new terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact</h2>
      <p className="mb-4">
        If you have any questions about these Terms, please contact us at
        support@jobassistantagent.com.
      </p>
    </div>
  );
}