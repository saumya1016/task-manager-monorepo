const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBoards,
  createBoard,
  getBoardById,
  kickMember,
  leaveBoard,
  deleteBoard,
  joinBoard
} = require('../controllers/boardController');

// Main routes
router.route('/')
  .get(protect, getBoards)
  .post(protect, createBoard);

router.route('/:id')
  .get(protect, getBoardById)
  .delete(protect, deleteBoard);

// Functional routes
router.put('/:id/leave', protect, leaveBoard);
router.put('/:id/join', protect, joinBoard);
router.delete('/:id/members/:userId', protect, kickMember); // ✅ Kick member route

module.exports = router;