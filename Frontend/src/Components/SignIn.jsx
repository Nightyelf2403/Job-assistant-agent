import React, { useState } from "react";
import "../styles/animations.css";
import { useNavigate } from "react-router-dom";
import API from "../api.js";

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTriggerAnimation(true);
    try {
      const res = await API.post("/login", form);
      console.log("✅ Login response:", res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user?.id || ""); 
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 max-w-md mx-auto signin-animation-container ${triggerAnimation ? 'animate-slideup' : ''}`}>
      <h2 className="text-xl font-bold mb-4 typing-effect">Welcome Back!</h2>
      <p className="mb-4 text-sm text-gray-600 typing-effect-sub">
        Let's get you logged in and one step closer to your dream job.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}