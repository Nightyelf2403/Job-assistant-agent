// src/Components/MultiStepform.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import "../styles/MultiStepform.css";
import countryCityOptions from "../data/locationOptions";
import skillOptions from "../data/skillOptions";
import API from "../api";

const positionOptions = [
  { value: "Entry Level", label: "Entry Level" },
  { value: "Internship", label: "Internship" },
  { value: "Mid Level", label: "Mid Level" },
  { value: "Senior", label: "Senior" }
];

const jobTypeOptions = [
  // Web & Full-Stack
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Backend Developer", label: "Backend Developer" },
  { value: "Full Stack Developer", label: "Full Stack Developer" },
  { value: "Frontend Developer Intern", label: "Frontend Developer Intern" },
  { value: "Backend Developer Intern", label: "Backend Developer Intern" },
  { value: "Full Stack Developer Intern", label: "Full Stack Developer Intern" },

  // Mobile
  { value: "Android Developer", label: "Android Developer" },
  { value: "iOS Developer", label: "iOS Developer" },
  { value: "React Native Developer", label: "React Native Developer" },
  { value: "Flutter Developer", label: "Flutter Developer" },
  { value: "Mobile App Developer Intern", label: "Mobile App Developer Intern" },

  // Data & AI
  { value: "Data Scientist", label: "Data Scientist" },
  { value: "Machine Learning Engineer", label: "Machine Learning Engineer" },
  { value: "AI Research Engineer", label: "AI Research Engineer" },
  { value: "NLP Engineer", label: "NLP Engineer" },
  { value: "Data Analyst", label: "Data Analyst" },
  { value: "Data Engineer", label: "Data Engineer" },
  { value: "ML Intern", label: "ML Intern" },
  { value: "Data Science Intern", label: "Data Science Intern" },

  // DevOps & Cloud
  { value: "DevOps Engineer", label: "DevOps Engineer" },
  { value: "Cloud Engineer", label: "Cloud Engineer" },
  { value: "SRE", label: "SRE" },
  { value: "Infrastructure Engineer", label: "Infrastructure Engineer" },
  { value: "DevOps Intern", label: "DevOps Intern" },

  // Security
  { value: "Cybersecurity Analyst", label: "Cybersecurity Analyst" },
  { value: "Security Engineer", label: "Security Engineer" },
  { value: "Ethical Hacker", label: "Ethical Hacker" },
  { value: "Cybersecurity Intern", label: "Cybersecurity Intern" },

  // Design
  { value: "UI/UX Designer", label: "UI/UX Designer" },
  { value: "Product Designer", label: "Product Designer" },
  { value: "UX Researcher", label: "UX Researcher" },
  { value: "UI/UX Design Intern", label: "UI/UX Design Intern" },

  // Emerging Tech
  { value: "AR/VR Developer", label: "AR/VR Developer" },
  { value: "Blockchain Developer", label: "Blockchain Developer" },
  { value: "Web3 Developer", label: "Web3 Developer" },
  { value: "Game Developer", label: "Game Developer" },
  { value: "XR Engineer", label: "XR Engineer" },

  // Other
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Software Engineer Intern", label: "Software Engineer Intern" },
  { value: "QA Engineer", label: "QA Engineer" },
  { value: "QA Tester", label: "QA Tester" },
  { value: "Technical PM", label: "Technical PM" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Tech Support", label: "Tech Support" }
];

const workPreferenceOptions = [
  { value: "Remote", label: "Remote" },
  { value: "Onsite", label: "Onsite" },
  { value: "Hybrid", label: "Hybrid" }
];

export default function MultiStepform({ isEditing = false }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    resume: null,
    currentLocation: "",
    preferredLocations: [],
    jobType: "",
    desiredPosition: "",
    desiredSalary: "",
    workPreference: [],
    skills: []
  });

  useEffect(() => {
    if (!isEditing) return;

    async function fetchProfile() {
      try {
        const { data } = await API.get(`/users/${userId}`);
        setForm({
          currentLocation: data.currentLocation || "",
          preferredLocations: data.preferredLocations?.map(v => ({ value: v, label: v })) || [],
          jobType: data.jobType || "",
          desiredPosition: data.desiredPosition || "",
          desiredSalary: data.desiredSalary || "",
          workPreference: data.workPreference?.map(v => ({ value: v, label: v })) || [],
          skills: data.skills?.map(v => ({ value: v, label: v })) || [],
          resume: null
        });
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      }
    }
    fetchProfile();
  }, [userId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      if (form.resume) formData.append("resume", form.resume);
      formData.append("currentLocation", form.currentLocation);
      formData.append("preferredLocations", JSON.stringify(form.preferredLocations.map(l => l.value)));
      formData.append("jobType", form.jobType);
      formData.append("desiredPosition", form.desiredPosition);
      formData.append("desiredSalary", form.desiredSalary);
      formData.append("workPreference", JSON.stringify(form.workPreference.map(wp => wp.value)));
      formData.append("skills", JSON.stringify(form.skills.map(s => s.value)));

      const response = await API.put(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 200) {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("❌ Submission failed:", err);
      const message = err?.response?.data?.error;
      if (Array.isArray(message)) {
        setError(message.map((m) => m.message).join(" | "));
      } else {
        setError(message || "Profile update failed. Please try again.");
      }
    }
  };

  return (
    <>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {isEditing ? "Edit Your Profile" : "Setup Your Profile"}
      </h2>
      <div className="multi-container">
        <div className="progress-bar">
          <div className={`progress-step ${step === 1 ? "active" : ""}`}>1</div>
          <div className={`progress-step ${step === 2 ? "active" : ""}`}>2</div>
          <div className={`progress-step ${step === 3 ? "active" : ""}`}>3</div>
        </div>

        <form className="multi-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <label>Upload Resume:</label>
              <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} />

              <label>Current Location:</label>
              <CreatableSelect
                isClearable
                options={countryCityOptions}
                value={
                  form.currentLocation
                    ? { label: form.currentLocation, value: form.currentLocation }
                    : null
                }
                onChange={(selected) =>
                  setForm((prev) => ({ ...prev, currentLocation: selected?.value || "" }))
                }
              />
            </>
          )}

          {step === 2 && (
            <>
              <label>Preferred Locations *</label>
              <CreatableSelect
                isMulti
                options={countryCityOptions}
                value={form.preferredLocations}
                onChange={(selected) => setForm((prev) => ({ ...prev, preferredLocations: selected }))}
              />

              <label>Job Type *</label>
              <CreatableSelect
                isClearable
                options={jobTypeOptions}
                value={form.jobType ? { label: form.jobType, value: form.jobType } : null}
                onChange={(selected) =>
                  setForm((prev) => ({ ...prev, jobType: selected ? selected.value : "" }))
                }
              />

              <label>Desired Position *</label>
              <Select
                options={positionOptions}
                value={positionOptions.find((opt) => opt.value === form.desiredPosition)}
                onChange={(selected) => setForm((prev) => ({ ...prev, desiredPosition: selected.value }))}
              />
            </>
          )}

          {step === 3 && (
            <>
              <label>Desired Salary:</label>
              <input
                name="desiredSalary"
                value={form.desiredSalary}
                onChange={handleChange}
                placeholder="e.g., ₹6 LPA"
              />

              <label>Work Preference *</label>
              <Select
                isMulti
                options={workPreferenceOptions}
                value={form.workPreference}
                onChange={(selected) => setForm((prev) => ({ ...prev, workPreference: selected }))}
              />

              <label>Skills *</label>
              <CreatableSelect
                isMulti
                options={skillOptions}
                value={form.skills}
                onChange={(selected) => setForm((prev) => ({ ...prev, skills: selected }))}
              />
            </>
          )}

          {error && <p className="error-msg">{error}</p>}

          <div className="multi-buttons">
            {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
            {step < 3 && <button type="button" onClick={nextStep}>Next</button>}
            {step === 3 && <button type="submit">Submit</button>}
            {isEditing && (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={{ marginLeft: "1rem", backgroundColor: "#e5e7eb", color: "#111827" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}