const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/boards
// @desc    Get all boards where user is Owner OR Member
router.get('/', protect, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user.id },           // Boards I created
        { 'members.user': req.user.id }   // Boards I was invited to
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
router.post('/', protect, async (req, res) => {
  try {
    const { title } = req.body;
    
    const board = await Board.create({
      title,
      owner: req.user.id,
      members: [] 
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/boards/:id
// @desc    Get single board details (Security Check included)
router.get('/:id', protect, async (req, res) => {
  try {
    // ✅ CRITICAL FIX: POPULATE NAMES
    const board = await Board.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

    if (!board) return res.status(404).json({ message: 'Board not found' });

    // Check permissions (Owner or Member)
    const isOwner = board.owner._id.toString() === req.user.id;
    const isMember = board.members.some(m => m.user && m.user._id.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(401).json({ message: 'Not authorized to view this board' });
    }

    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// JOINING LOGIC
// ---------------------------------------------------------

// @route   PUT /api/boards/:id/join
// @desc    Add the logged-in user to the board's members list
router.put('/:id/join', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    // 1. Check if user is already in the board (Owner or Member)
    const isOwner = board.owner.toString() === req.user.id;
    const isMember = board.members.some(m => m.user.toString() === req.user.id);

    if (isOwner || isMember) {
        return res.status(200).json(board);
    }

    // 2. ✅ READ ROLE FROM FRONTEND (Default to 'viewer' if missing)
    const role = req.body.role || 'viewer';

    // 3. Add user to members list with the specific role
    board.members.push({ 
        user: req.user.id, 
        role: role 
    });

    await board.save();

    // 4. SEND NOTIFICATION TO OWNER
    if (!isOwner) {
        await User.findByIdAndUpdate(board.owner, {
            $push: { 
                notifications: { 
                    message: `${req.user.name} joined your board "${board.title}" as ${role}`, 
                    boardId: board._id,
                    createdAt: new Date()
                } 
            }
        });
    }

    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;