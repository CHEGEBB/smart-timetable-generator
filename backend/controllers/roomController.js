const Room = require('../models/Room');
const mongoose = require('mongoose');

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    // Check if error is a valid ObjectId error
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new room
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    // Check if error is a valid ObjectId error
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    await room.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    // Check if error is a valid ObjectId error
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Toggle room availability
exports.toggleAvailability = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    room.available = !room.available;
    await room.save();
    
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    // Check if error is a valid ObjectId error
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};