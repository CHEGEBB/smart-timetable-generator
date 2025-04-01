const express = require('express');
const router = express.Router();
const { 
  generateNewTimetable, 
  getAllTimetables, 
  getTimetableById, 
  getTeacherTimetable, 
  getClassTimetable, 
  getRoomTimetable, 
  deleteTimetable 
} = require('../controllers/timetableController');

// Authentication middleware (you should import your actual auth middleware)
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Timetable Routes
 */

// Generate a new timetable
router.post('/generate', generateNewTimetable);

// Get all timetables (just names and creation dates for listing)
router.get('/', getAllTimetables);

// Get a specific timetable by ID
router.get('/:id', getTimetableById);

// Get timetable for a specific teacher
router.get('/teacher/:name', getTeacherTimetable);

// Get timetable for a specific class
router.get('/class/:name', getClassTimetable);

// Get timetable for a specific room
router.get('/room/:name', getRoomTimetable);

// Delete a timetable (admin only)
router.delete('/:id', protect, authorize('admin'), deleteTimetable);

module.exports = router;