const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  schedule: [{
    day: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    period: {
      type: Number,
      required: true
    },
    class: {
      type: String,
      required: true,
      ref: 'Class'
    },
    subject: {
      type: String,
      required: true
    },
    teacher: {
      type: String,
      required: true,
      ref: 'Teacher'
    },
    room: {
      type: String,
      required: true,
      ref: 'Room'
    }
  }]
}, { timestamps: true });

// Index for faster queries by class, teacher, and room
timetableSchema.index({ 'schedule.class': 1 });
timetableSchema.index({ 'schedule.teacher': 1 });
timetableSchema.index({ 'schedule.room': 1 });

module.exports = mongoose.model('Timetable', timetableSchema);