const express = require('express');
const router = express.Router();
const { 
  getAllClasses, 
  getClass, 
  createClass, 
  updateClass, 
  deleteClass 
} = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getAllClasses)
  .post( createClass);

router
  .route('/:id')
  .get( getClass)
  .put( updateClass)
  .delete( deleteClass);

module.exports = router;