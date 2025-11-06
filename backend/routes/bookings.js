const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, createBooking);
router.get('/user', authMiddleware, getUserBookings);
router.get('/all', authMiddleware, adminMiddleware, getAllBookings);
router.put('/:id/cancel', authMiddleware, cancelBooking);

module.exports = router;
