import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t text-center text-sm text-gray-500 py-4 mt-auto">
      <p>&copy; 2025 Job Assistant. All rights reserved.</p>
      <div className="mt-2 space-x-4">
        <a href="/terms" className="hover:text-indigo-600">Terms</a>
        <a href="/faq" className="hover:text-indigo-600">FAQ</a>
        <a href="/about" className="hover:text-indigo-600">About</a>
      </div>
    </footer>
  );
}
