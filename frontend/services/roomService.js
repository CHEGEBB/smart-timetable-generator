import axios from './axiosConfig';

// Get all rooms
export const getRooms = async () => {
  try {
    const response = await axios.get('/rooms');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Get a single room
export const getRoom = async (id) => {
  try {
    const response = await axios.get(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Create a new room
export const createRoom = async (roomData) => {
  try {
    const response = await axios.post('/rooms', roomData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Update a room
export const updateRoom = async (id, roomData) => {
  try {
    const response = await axios.put(`/rooms/${id}`, roomData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Delete a room
export const deleteRoom = async (id) => {
  try {
    const response = await axios.delete(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};

// Toggle room availability
export const toggleRoomAvailability = async (id) => {
  try {
    const response = await axios.put(`/rooms/${id}/toggle-availability`, {});
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server error');
  }
};