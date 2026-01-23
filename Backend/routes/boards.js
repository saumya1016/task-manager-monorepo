const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const User = require('../models/User'); 
const Task = require('../models/Task'); 
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
// @desc    Get single board details
router.get('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

    if (!board) return res.status(404).json({ message: 'Board not found' });

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
// ✅ NEW: LEAVE WORKSPACE LOGIC
// ---------------------------------------------------------

// @route   PUT /api/boards/:id/leave
// @desc    Remove the logged-in user from the members list
router.put('/:id/leave', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // 1. Security check: Owners cannot "leave" (they must delete)
    if (board.owner.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'Owners cannot leave their own workspace. Please delete the workspace instead.' 
      });
    }

    // 2. Remove the user from the members array
    board.members = board.members.filter(
      (m) => m.user.toString() !== req.user.id
    );

    await board.save();

    // 3. Cleanup: Remove notifications for this board from the user's profile
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { notifications: { boardId: req.params.id } }
    });

    res.status(200).json({ message: 'Successfully left the workspace' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// DELETE LOGIC (With Cascading Task Deletion)
// ---------------------------------------------------------

// @route   DELETE /api/boards/:id
// @desc    Delete a board and all its tasks (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this workspace' });
    }

    // 1. Delete all tasks linked to this board
    await Task.deleteMany({ board: req.params.id });

    // 2. Remove board notifications from ALL users
    await User.updateMany(
      { "notifications.boardId": req.params.id },
      { $pull: { notifications: { boardId: req.params.id } } }
    );

    // 3. Delete the board itself
    await board.deleteOne();

    res.status(200).json({ message: 'Workspace and all associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// JOINING LOGIC
// ---------------------------------------------------------

router.put('/:id/join', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user.id;
    const isMember = board.members.some(m => m.user.toString() === req.user.id);

    if (isOwner || isMember) {
        return res.status(200).json(board);
    }

    const role = req.body.role || 'viewer';

    board.members.push({ 
        user: req.user.id, 
        role: role 
    });

    await board.save();

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