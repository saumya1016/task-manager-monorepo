const express = require('express');
const router = express.Router();
const auth = require('./auth')

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
    .populate('members', 'name email avatar') // Load member details
    .populate('owner', 'name email'); // Load owner details

    res.json(boards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;