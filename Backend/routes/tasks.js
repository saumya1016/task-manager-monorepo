const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Board = require('../models/Board'); 
const { protect } = require('../middleware/authMiddleware');

// ---------------------------------------------------------
// ✅ ROUTE: MY TASKS (Must be defined before :id routes)
// ---------------------------------------------------------
// @route   GET /api/tasks/my-tasks
// @desc    Get all tasks assigned to the logged-in user
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('board', 'title') 
      .sort({ deadline: 1 }); 

    const formattedTasks = tasks.map(task => ({
      _id: task._id,
      title: task.content,
      priority: task.priority,
      status: task.status === 'col-4' ? 'Completed' : 'Pending',
      deadline: task.deadline,
      boardTitle: task.board ? task.board.title : 'Unknown Board',
      boardId: task.board ? task.board._id : null
    }));

    res.json(formattedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics (Global or Board-specific)
router.get('/stats', protect, async (req, res) => {
  try {
    const { boardId } = req.query; 
    let query = {};

    if (boardId) {
        query = { board: boardId };
    } else {
        query = { assignedTo: req.user.id };
    }

    const completed = await Task.countDocuments({ ...query, status: 'col-4' });
    const inProgress = await Task.countDocuments({ ...query, status: 'col-2' });
    const totalAssigned = await Task.countDocuments(query);
    
    const efficiency = totalAssigned === 0 ? 0 : Math.round((completed / totalAssigned) * 100);

    res.status(200).json({ completed, inProgress, efficiency: `${efficiency}%` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tasks (Get tasks for a specific board)
router.get('/', protect, async (req, res) => {
  try {
    const { boardId } = req.query;

    if (!boardId) return res.status(400).json({ message: 'Board ID is required' });

    // Security: Check permissions
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user.id;
    const isMember = board.members.some(m => m.user.toString() === req.user.id);

    if (!isOwner && !isMember) {
        return res.status(401).json({ message: 'Not authorized to view this board' });
    }

    const tasks = await Task.find({ board: boardId }).sort({ position: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { content, description, tag, priority, status, deadline, boardId } = req.body;

    if (!boardId) return res.status(400).json({ message: "Board ID required" });

    const taskCount = await Task.countDocuments({ board: boardId, status: status || 'col-1' });

    const task = await Task.create({
      board: boardId,
      content,
      description: description || '',
      tag: tag || 'General',
      priority: priority || 'Medium',
      status: status || 'col-1',
      deadline,
      assignee: req.user.name, 
      assignedTo: req.user.id, // Defaults to creator
      position: taskCount,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ---------------------------------------------------------
// ✅ FIXED PUT ROUTE (This fixes your bug)
// ---------------------------------------------------------
// @route   PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    // Using findByIdAndUpdate is cleaner and handles ALL fields (including assignedTo).
    // { new: true } ensures we return the UPDATED document, not the old one.
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true } 
    );

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;