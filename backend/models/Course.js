const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  credit: {
    type: Number,
    required: [true, 'Credit hours are required'],
    min: 1,
    max: 6
  },
  instructor: {
    type: String,
    trim: true
  },
  students: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);