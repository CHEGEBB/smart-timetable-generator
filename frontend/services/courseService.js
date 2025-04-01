import axios from './axiosConfig';

// Get all courses
export const getCourses = async () => {
  try {
    const response = await axios.get('/courses');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Get a single course
export const getCourse = async (id) => {
  try {
    const response = await axios.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Create a new course
export const createCourse = async (courseData) => {
  try {
    const response = await axios.post('/courses', courseData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Update a course
export const updateCourse = async (id, courseData) => {
  try {
    const response = await axios.put(`/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Delete a course
export const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};