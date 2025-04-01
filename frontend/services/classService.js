import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-timetable-generator-1.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    const message = 
      error.response?.data?.error || 
      'Something went wrong';
    return Promise.reject({ error: message });
  }
);

// Get all classes
export const getClasses = async () => {
  try {
    const response = await api.get('/api/classes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get class by ID
export const getClassById = async (id) => {
  try {
    const response = await api.get(`/api/classes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new class
export const createClass = async (classData) => {
  try {
    const response = await api.post('/api/classes', classData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update class
export const updateClass = async (id, classData) => {
  try {
    const response = await api.put(`/api/classes/${id}`, classData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete class
export const deleteClass = async (id) => {
  try {
    const response = await api.delete(`/api/classes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};