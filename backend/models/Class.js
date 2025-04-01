const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  students: {
    type: Number,
    required: [true, 'Number of students is required'],
    min: [1, 'Class must have at least 1 student']
  },
  subjects: {
    type: [String],
    required: [true, 'At least one subject is required']
  },
  classTeacher: {
    type: String,
    required: [true, 'Class teacher is required'],
    trim: true
  },
  roomAssigned: {
    type: String,
    required: [true, 'Room assignment is required'],
    trim: true
  },
  schedule: {
    monday: [String],
    tuesday: [String],
    wednesday: [String],
    thursday: [String],
    friday: [String]
  },
  image: {
    type: String,
    default: '/assets/class1.jpeg'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);