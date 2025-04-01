const jwt = require('jsonwebtoken');
const User = require('../models/User');
const createError = require('http-errors');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'timetable-app-secret-key-change-in-production';

exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

exports.protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  } 
  // If no token was found in the auth header, check cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is found, return error
  if (!token) {
    return next(createError(401, 'Not authorized to access this route'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user with the ID from token
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(createError(401, 'User not found'));
    }

    next();
  } catch (error) {
    return next(createError(401, 'Not authorized to access this route'));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Not authorized to access this route'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, `User role ${req.user.role} is not authorized to access this route`)
      );
    }
    
    next();
  };
};