const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    // FIX: Filter by the logged-in user's ID
    const tasks = await Task.find({ user: req.user.id }).sort({ position: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { content, description, tag, priority, status, deadline } = req.body;

    // FIX: Only count tasks belonging to THIS user
    const taskCount = await Task.countDocuments({ 
      user: req.user.id, 
      status: status || 'col-1' 
    });

    const task = await Task.create({
      user: req.user.id, // FIX: Save the owner's ID
      content,
      description: description || '',
      tag: tag || 'General',
      priority: priority || 'Medium',
      status: status || 'col-1',
      deadline,
      assignee: req.user.name, 
      position: taskCount,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/tasks/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id; // FIX: Use unique ID, not name/avatar

    const completed = await Task.countDocuments({ 
      user: userId, 
      status: 'col-4' 
    });

    const inProgress = await Task.countDocuments({ 
      user: userId, 
      status: 'col-2' 
    });

    const totalAssigned = await Task.countDocuments({ user: userId });
    const efficiency = totalAssigned === 0 ? 0 : Math.round((completed / totalAssigned) * 100);

    res.status(200).json({ completed, inProgress, efficiency: `${efficiency}%` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // FIX: Security Check - Ensure user owns this task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task.status = req.body.status || task.status;
    task.content = req.body.content || task.content;
    task.priority = req.body.priority || task.priority;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.deadline !== undefined) task.deadline = req.body.deadline;
    if (req.body.position !== undefined) task.position = req.body.position;

    const updatedTask = await task.save();
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

    // FIX: Security Check - Ensure user owns this task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;