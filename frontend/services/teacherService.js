import axios from './axiosConfig';

// Get all teachers
export const getTeachers = async () => {
  try {
    const response = await axios.get('/teachers');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Get a single teacher
export const getTeacher = async (id) => {
  try {
    const response = await axios.get(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Create a new teacher
export const createTeacher = async (teacherData) => {
  try {
    const response = await axios.post('/teachers', teacherData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Update a teacher
export const updateTeacher = async (id, teacherData) => {
  try {
    const response = await axios.put(`/teachers/${id}`, teacherData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Delete a teacher
export const deleteTeacher = async (id) => {
  try {
    const response = await axios.delete(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};