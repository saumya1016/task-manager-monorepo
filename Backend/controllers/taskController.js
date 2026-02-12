const Task = require('../models/Task');
const Board = require('../models/Board');

// @desc    Get all tasks assigned to the logged-in user
// @route   GET /api/tasks/my-tasks
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate('board', 'title')
            .sort({ deadline: 1 });

        const validTasks = tasks.filter(task => task.board !== null);

        const formattedTasks = validTasks.map(task => ({
            _id: task._id,
            title: task.content,
            priority: task.priority,
            status: task.status === 'col-4' ? 'Completed' : 'Pending',
            deadline: task.deadline,
            boardTitle: task.board.title,
            boardId: task.board._id
        }));

        res.json(formattedTasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
exports.getTaskStats = async (req, res) => {
    try {
        const { boardId } = req.query;
        let query = boardId ? { board: boardId } : { assignedTo: req.user.id };

        const completed = await Task.countDocuments({ ...query, status: 'col-4' });
        const inProgress = await Task.countDocuments({ ...query, status: 'col-2' });
        const totalAssigned = await Task.countDocuments(query);
        const efficiency = totalAssigned === 0 ? 0 : Math.round((completed / totalAssigned) * 100);

        res.status(200).json({ completed, inProgress, efficiency: `${efficiency}%` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tasks for a specific board
// @route   GET /api/tasks
exports.getBoardTasks = async (req, res) => {
    try {
        const { boardId } = req.query;
        if (!boardId) return res.status(400).json({ message: 'Board ID required' });

        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ message: 'Board not found' });

        // Authorization check
        const isOwner = board.owner.toString() === req.user.id;
        const isMember = board.members.some(m => m.user.toString() === req.user.id);
        if (!isOwner && !isMember) return res.status(401).json({ message: 'Not authorized' });

        const tasks = await Task.find({ board: boardId }).sort({ position: 1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { boardId, status } = req.body;
        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ message: "Board not found" });

        const isOwner = board.owner.toString() === req.user.id;
        const member = board.members.find(m => m.user.toString() === req.user.id);
        
        // Check: Must be Owner OR have 'admin' role
        const hasPower = isOwner || member?.role === 'admin';

        if (!hasPower) {
            return res.status(403).json({ message: "Only Owners and Admins can create tasks" });
        }

        const taskCount = await Task.countDocuments({ board: boardId, status: status || 'col-1' });
        const task = await Task.create({
            ...req.body,
            board: boardId,
            assignee: req.user.name,
            assignedTo: req.user.id,
            position: taskCount,
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const board = await Board.findById(task.board);
        
        // 🔒 RBAC Check
        const isOwner = board.owner.toString() === req.user.id;
        const member = board.members.find(m => m.user.toString() === req.user.id);
        if (!isOwner && member?.role === 'viewer') {
            return res.status(403).json({ message: "Viewers cannot edit tasks" });
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const board = await Board.findById(task.board);
        
        // 1. Check if user is the absolute Owner
        const isOwner = board.owner.toString() === req.user.id;

        // 2. Check if user is an invited Member with the 'admin' role
        const member = board.members.find(m => m.user.toString() === req.user.id);
        const isAdmin = member?.role === 'admin';

        // 🔒 Only Owner or Admin can delete
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Only the Owner and Admins can delete tasks" });
        }

        await task.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};