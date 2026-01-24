const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import all controller functions
const {
    getMyTasks,
    getTaskStats,
    getBoardTasks,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

// Define Routes
router.get('/my-tasks', protect, getMyTasks);
router.get('/stats', protect, getTaskStats);

// Generic routes
router.route('/')
    .get(protect, getBoardTasks)
    .post(protect, createTask);

router.route('/:id')
    .put(protect, updateTask)
    .delete(protect, deleteTask);

module.exports = router;