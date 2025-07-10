import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;

      try {
        const res = await fetch(`http://localhost:5050/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };

    if (isLoggedIn) fetchUser();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-50 shadow-md px-8 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-extrabold text-indigo-700 hover:text-indigo-800 transition-colors">
        Job Assistant
      </Link>
      <div className="flex items-center space-x-6">
        <Link
          to="/"
          className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          to="/resume-score"
          className="px-4 py-2 rounded-md font-medium text-sm transition-colors text-indigo-600 hover:bg-indigo-50 border border-indigo-600"
        >
          Tailor Resume
        </Link>
        {isLoggedIn ? (
          <>
            <div className="relative">
              <button
                onClick={() => setShowProfile(prev => !prev)}
                className="px-4 py-2 rounded-md font-medium text-sm transition-colors text-indigo-600 hover:bg-indigo-50 border border-indigo-600"
              >
                Profile
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-[700px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-black" />
                    <div>
                      <h2 className="text-lg font-bold">{user?.name || "N/A"}</h2>
                      <p>Email: {user?.email || "Not available"}</p>
                      <p>Phone: {user?.phone || "Not available"}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Location:</strong> {user?.currentLocation || "N/A"}</p>
                    <p><strong>Preferred Locations:</strong> {(user?.preferredLocations || []).join(", ") || "N/A"}</p>
                    <p><strong>Job Type:</strong> {user?.jobType || "N/A"}</p>
                    <p><strong>Desired Position:</strong> {user?.desiredPosition || "N/A"}</p>
                    <p><strong>Work Preference:</strong> {(user?.workPreference || []).join(", ") || "N/A"}</p>
                    <p><strong>Skills:</strong> {(user?.skills || []).join(", ") || "N/A"}</p>
                    <p><strong>Desired Salary:</strong> {user?.desiredSalary || "N/A"}</p>
                    <p><strong>Resume:</strong> {user?.resumeLink ? <a href={user.resumeLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">View</a> : "N/A"}</p>
                    <p><strong>Education:</strong> {user?.education?.length ? user.education.map((edu, i) => <span key={i}>{edu.institution || "Unknown"}{i < user.education.length - 1 ? ", " : ""}</span>) : "N/A"}</p>
                    <p><strong>Work History:</strong> {user?.workHistory?.length ? user.workHistory.map((job, i) => <span key={i}>{job.role || "Role"} @ {job.company || "Company"}{i < user.workHistory.length - 1 ? ", " : ""}</span>) : "N/A"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate("/profile/edit");
                    }}
                    className="mt-4 px-4 py-2 rounded-md font-medium text-sm transition-colors bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md font-medium text-sm transition-colors bg-red-500 text-white hover:bg-red-600 border border-red-500"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signin"
              className="px-4 py-2 rounded-md font-medium text-sm transition-colors text-indigo-600 hover:bg-indigo-50 border border-indigo-600"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-md font-medium text-sm transition-colors bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
