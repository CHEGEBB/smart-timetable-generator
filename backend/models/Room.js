const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  building: {
    type: String,
    required: [true, 'Building name is required'],
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required'],
    min: [0, 'Floor number must be non-negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  hasProjector: {
    type: Boolean,
    default: false
  },
  hasComputers: {
    type: Boolean,
    default: false
  },
  hasWifi: {
    type: Boolean,
    default: true
  },
  hasCoffee: {
    type: Boolean,
    default: false
  },
  isCertified: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: "/assets/class1.jpg"
  },
  lastBooked: {
    type: String,
    default: "Never"
  },
  nextSession: {
    type: String,
    default: "Not scheduled"
  }
}, {
  timestamps: true
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;