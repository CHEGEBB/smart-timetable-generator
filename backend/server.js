const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const createError = require('http-errors');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const timetableRoutes = require('./routes/timetable');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });

// Middleware
app.use(helmet()); // Set security-related HTTP headers
app.use(cors()); // Enable CORS for all requests
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse Cookie header
app.use(compression()); // Compress all responses

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/data', dataRoutes);
// app.use('/api/timetable', timetableRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Smart Timetable Generator API is running');
});

// 404 handler
app.use((req, res, next) => {
  next(createError(404, 'Route not found'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Do not exit the process in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});
