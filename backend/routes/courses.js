const express = require('express');
const { 
  getCourses, 
  getCourse, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply protection to all routes
// router.use(protect);

router.route('/')
  .get(getCourses)
  .post( validateFields(['code', 'name', 'department', 'credit']), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

module.exports = router;