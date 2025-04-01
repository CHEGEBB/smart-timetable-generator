const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Course = require('../models/Course');
const { generateTimetable } = require('../utils/timetableAlgorithm');

/**
 * Generate a new timetable
 * @route POST /api/timetable/generate
 * @access Private
 */
exports.generateNewTimetable = async (req, res) => {
  try {
    // Get constraints from request body
    const { name, periodsPerDay = 7, workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] } = req.body;

    // Fetch all required data
    const classes = await Class.find();
    const teachers = await Teacher.find();
    const rooms = await Room.find();
    const courses = await Course.find();

    if (classes.length === 0) {
      return res.status(400).json({ message: 'No classes found to create timetable' });
    }

    if (teachers.length === 0) {
      return res.status(400).json({ message: 'No teachers found to create timetable' });
    }

    if (rooms.length === 0) {
      return res.status(400).json({ message: 'No rooms found to create timetable' });
    }

    if (courses.length === 0) {
      return res.status(400).json({ message: 'No courses found to create timetable' });
    }

    // Generate timetable using algorithm
    const timetableData = generateTimetable(classes, teachers, rooms, courses, {
      periodsPerDay,
      workingDays
    });

    // Add custom name if provided
    if (name) {
      timetableData.name = name;
    }

    // Save to database
    const timetable = new Timetable(timetableData);
    await timetable.save();

    res.status(201).json({ 
      success: true, 
      message: 'Timetable generated successfully',
      timetable 
    });
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating timetable', 
      error: error.message 
    });
  }
};

/**
 * Get all timetables
 * @route GET /api/timetable
 * @access Private
 */
exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find().select('name createdAt');
    res.status(200).json({ 
      success: true, 
      count: timetables.length, 
      timetables 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching timetables', 
      error: error.message 
    });
  }
};

/**
 * Get timetable by ID
 * @route GET /api/timetable/:id
 * @access Private
 */
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }
    res.status(200).json({ 
      success: true, 
      timetable 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching timetable', 
      error: error.message 
    });
  }
};

/**
 * Get timetable for a specific teacher
 * @route GET /api/timetable/teacher/:name
 * @access Private
 */
exports.getTeacherTimetable = async (req, res) => {
  try {
    const teacherName = req.params.name;
    
    // Check if teacher exists
    const teacher = await Teacher.findOne({ name: teacherName });
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Find latest timetable
    const latestTimetable = await Timetable.findOne().sort('-createdAt');
    if (!latestTimetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'No timetable found' 
      });
    }

    // Filter schedule for this teacher
    const teacherSchedule = latestTimetable.schedule.filter(
      slot => slot.teacher === teacherName
    );

    res.status(200).json({ 
      success: true, 
      teacher: teacherName,
      schedule: teacherSchedule 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching teacher timetable', 
      error: error.message 
    });
  }
};

/**
 * Get timetable for a specific class
 * @route GET /api/timetable/class/:name
 * @access Private
 */
exports.getClassTimetable = async (req, res) => {
  try {
    const className = req.params.name;
    
    // Check if class exists
    const classData = await Class.findOne({ name: className });
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Find latest timetable
    const latestTimetable = await Timetable.findOne().sort('-createdAt');
    if (!latestTimetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'No timetable found' 
      });
    }

    // Filter schedule for this class
    const classSchedule = latestTimetable.schedule.filter(
      slot => slot.class === className
    );

    res.status(200).json({ 
      success: true, 
      class: className,
      schedule: classSchedule 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching class timetable', 
      error: error.message 
    });
  }
};

/**
 * Get timetable for a specific room
 * @route GET /api/timetable/room/:name
 * @access Private
 */
exports.getRoomTimetable = async (req, res) => {
  try {
    const roomName = req.params.name;
    
    // Check if room exists
    const room = await Room.findOne({ name: roomName });
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }

    // Find latest timetable
    const latestTimetable = await Timetable.findOne().sort('-createdAt');
    if (!latestTimetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'No timetable found' 
      });
    }

    // Filter schedule for this room
    const roomSchedule = latestTimetable.schedule.filter(
      slot => slot.room === roomName
    );

    res.status(200).json({ 
      success: true, 
      room: roomName,
      schedule: roomSchedule 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching room timetable', 
      error: error.message 
    });
  }
};

/**
 * Delete a timetable
 * @route DELETE /api/timetable/:id
 * @access Private
 */
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    await timetable.remove();
    res.status(200).json({ 
      success: true, 
      message: 'Timetable deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting timetable', 
      error: error.message 
    });
  }
};