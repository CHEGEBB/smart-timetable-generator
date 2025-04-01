const { body, validationResult } = require('express-validator');
const createError = require('http-errors');


/**
 * Middleware to validate request data using express-validator
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  next();
};

/**
 * Middleware to validate that required models have data before generating timetable
 */
exports.validateTimetableData = async (req, res, next) => {
  try {
    const Class = require('../models/Class');
    const Teacher = require('../models/Teacher');
    const Room = require('../models/Room');
    const Course = require('../models/Course');

    const classCount = await Class.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const roomCount = await Room.countDocuments();
    const courseCount = await Course.countDocuments();

    const errors = [];

    if (classCount === 0) errors.push('No classes found');
    if (teacherCount === 0) errors.push('No teachers found');
    if (roomCount === 0) errors.push('No rooms found');
    if (courseCount === 0) errors.push('No courses found');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate timetable',
        errors
      });
    }

    next();
  } catch (error) {
    next(createError(500, 'Server error during validation'));
  }
};

// User registration validation rules
exports.registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'teacher']).withMessage('Role must be either admin or teacher')
];

// User login validation rules
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

// Validation result middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};
// Validate request body fields
exports.validateFields = (requiredFields) => {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          error: `Please provide ${field}`
        });
      }
    }
    next();
  };
};