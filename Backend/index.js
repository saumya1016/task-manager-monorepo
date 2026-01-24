const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // ✅ Required for Socket.io
const { Server } = require('socket.io'); // ✅ Required for Socket.io
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const boardRoutes = require('./routes/boards');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // ✅ Create HTTP server

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Presence Tracking Store
const activeUsers = {}; // Structure: { boardId: [userId1, userId2] }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ✅ 1. JOIN PRESENCE ROOM
  socket.on('join-presence', ({ boardId, userId }) => {
    socket.join(boardId);
    socket.userId = userId; // Store for disconnect logic
    socket.boardId = boardId;

    if (!activeUsers[boardId]) activeUsers[boardId] = [];
    if (!activeUsers[boardId].includes(userId)) {
      activeUsers[boardId].push(userId);
    }

    // Broadcast updated list to everyone in that specific board room
    io.to(boardId).emit('online-users-update', activeUsers[boardId]);
  });

  // ✅ 2. HANDLE DISCONNECT
  socket.on('disconnect', () => {
    const { boardId, userId } = socket;
    if (boardId && activeUsers[boardId]) {
      activeUsers[boardId] = activeUsers[boardId].filter(id => id !== userId);
      io.to(boardId).emit('online-users-update', activeUsers[boardId]);
    }
    console.log('User disconnected');
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);

const PORT = process.env.PORT || 5000;

// ✅ IMPORTANT: Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});