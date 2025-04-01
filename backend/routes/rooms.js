const express = require('express');
const router = express.Router();
const { 
  getAllRooms, 
  getRoomById, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  toggleAvailability
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
// router.use(protect);

// Route for getting all rooms and creating a new room
router
  .route('/')
  .get(getAllRooms)
  .post(createRoom);

// Route for getting, updating, and deleting a specific room
router
  .route('/:id')
  .get(getRoomById)
  .put(updateRoom)
  .delete(deleteRoom);

// Route for toggling room availability
router.put('/:id/toggle-availability', toggleAvailability);

module.exports = router;