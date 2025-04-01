const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  monday: [Boolean],
  tuesday: [Boolean],
  wednesday: [Boolean],
  thursday: [Boolean],
  friday: [Boolean]
}, { _id: false });

const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true
  },
  subjects: {
    type: [String],
    required: [true, 'At least one subject is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Contact information is required'],
    trim: true
  },
  availability: {
    type: availabilitySchema,
    required: [true, 'Availability information is required'],
    default: {
      monday: [true, true, true, true, true],
      tuesday: [true, true, true, true, true],
      wednesday: [true, true, true, true, true],
      thursday: [true, true, true, true, true],
      friday: [true, true, true, true, true]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Teacher', TeacherSchema);