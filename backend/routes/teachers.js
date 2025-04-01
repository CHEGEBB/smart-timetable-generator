const express = require('express');
const { 
  getTeachers, 
  getTeacher, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher 
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply protection to all routes
// router.use(protect);

router.route('/')
  .get(getTeachers)
  .post(validateFields(['name', 'subjects', 'department', 'contact']), createTeacher);

router.route('/:id')
  .get(getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

module.exports = router;