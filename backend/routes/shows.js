const express = require('express');
const router = express.Router();
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  getShowSeats
} = require('../controllers/showController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getAllShows);
router.get('/:id', getShowById);
router.get('/:id/seats', getShowSeats);
router.post('/', authMiddleware, adminMiddleware, createShow);
router.put('/:id', authMiddleware, adminMiddleware, updateShow);
router.delete('/:id', authMiddleware, adminMiddleware, deleteShow);

module.exports = router;
