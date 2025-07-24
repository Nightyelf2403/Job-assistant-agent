// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5050/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// Submit AI application
export const submitAIApplication = async (data) => {
  try {
    const response = await API.post('/applications/ai-submit', data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to submit AI application:', error.response?.data || error.message);
    throw error;
  }
};
