const Board = require('../models/Board');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all boards where user is Owner OR Member
// @route   GET /api/boards
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('members.user', 'name email') // ✅ Populate for Profile Member List
    .sort({ createdAt: -1 });
    
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new board
// @route   POST /api/boards
exports.createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      title: req.body.title,
      owner: req.user.id,
      members: [] 
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single board details
// @route   GET /api/boards/:id
exports.getBoardById = async (req, res) => {
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
};

// @desc    Kick a member from workspace (Owner only)
// @route   DELETE /api/boards/:id/members/:userId
exports.kickMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only owners can remove members' });
    }

    board.members = board.members.filter(m => m.user.toString() !== req.params.userId);
    await board.save();
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove logged-in user from members list
// @route   PUT /api/boards/:id/leave
exports.leaveBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    if (board.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Owners cannot leave. Delete the workspace instead.' });
    }

    board.members = board.members.filter(m => m.user.toString() !== req.user.id);
    await board.save();

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { notifications: { boardId: req.params.id } }
    });

    res.status(200).json({ message: 'Successfully left the workspace' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete board and associated tasks
// @route   DELETE /api/boards/:id
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    if (board.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Task.deleteMany({ board: req.params.id });
    await User.updateMany(
      { "notifications.boardId": req.params.id },
      { $pull: { notifications: { boardId: req.params.id } } }
    );

    await board.deleteOne();
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a board via link
// @route   PUT /api/boards/:id/join
exports.joinBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user.id;
    const isMember = board.members.some(m => m.user.toString() === req.user.id);

    if (isOwner || isMember) return res.status(200).json(board);

    const role = req.body.role || 'viewer';
    board.members.push({ user: req.user.id, role: role });
    await board.save();

    if (!isOwner) {
      await User.findByIdAndUpdate(board.owner, {
        $push: { 
          notifications: { 
            message: `${req.user.name} joined "${board.title}" as ${role}`, 
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
};