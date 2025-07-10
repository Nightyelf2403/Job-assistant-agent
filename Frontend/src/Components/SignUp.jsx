import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/signup", form);
      if (res.status === 201) {
        console.log("✅ Signup successful. User ID:", res.data.user.id);
        localStorage.setItem("userId", res.data.user.id); // ✅ important!
        navigate("/profile-setup");
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (Array.isArray(errorData?.error)) {
        const messages = errorData.error.map((e) => e.message);
        setError(messages.join(", "));
      } else {
        setError(errorData?.error || "Signup failed");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <p className="text-center text-lg font-medium text-gray-700 mb-2 animate-pulse">Join the future of job hunting with smart AI!</p>
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border"
          required
        />
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
          type="tel"
          name="phone"
          placeholder="+91XXXXXXXXXX"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border"
          required
          pattern="^\+\d{1,3}\d{10}$"
          title="Enter a valid number like +919876543210"
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
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
          Sign Up
        </button>
        {error && <p className="text-red-500">{error}</p>}
        <p className="text-sm mt-2 text-center">
          Already a user?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Click here
          </span>
        </p>
      </form>
    </div>
  );
}