const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Ensure path is correct for your project
const Board = require('../models/Board'); // <--- Added missing import

// @route GET /api/boards
// @desc Get all boards for the logged-in user (Owned + Shared)
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user.id },    // Boards I created
        { members: req.user.id }   // Boards I was invited to
      ]
    })
    .populate('members', 'name email') // Load member details
    .populate('owner', 'name email'); // Load owner details

    res.json(boards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/boards
// @desc Create a new board
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const newBoard = new Board({
      name,
      owner: req.user.id,
      columns: [
        { id: 'col-1', title: 'To Do', taskIds: [] },
        { id: 'col-2', title: 'In Progress', taskIds: [] },
        { id: 'col-3', title: 'Done', taskIds: [] }
      ]
    });

    const board = await newBoard.save();
    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/boards/:id/join
// @desc Allow a user to join a board via a shared link
router.post('/:id/join', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner
    if (board.owner.toString() === req.user.id) {
        return res.status(200).json({ message: 'You are the owner', boardId: board._id });
    }

    // Check if user is already a member
    if (board.members.includes(req.user.id)) {
      return res.status(200).json({ message: 'Already a member', boardId: board._id });
    }

    // Add the user to the members list
    board.members.push(req.user.id);
    await board.save();

    res.json({ message: 'Joined successfully', boardId: board._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;