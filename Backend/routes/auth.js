const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // 👈 ADDED THIS IMPORT

// ❌ REMOVED: const sendEmail = require('../utils/sendEmail'); 

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- SIGNUP ---
// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- LOGIN ---
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- FORGOT PASSWORD ---
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account with that email exists." });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    res.status(200).json({ message: "Password reset logic needs Frontend implementation." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- RESET PASSWORD ---
// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- GOOGLE SYNC / LOGIN ---
// @route   POST /api/auth/google-sync
router.post('/google-sync', async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || name.charAt(0).toUpperCase(),
        password: crypto.randomBytes(16).toString('hex') 
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Google Sync failed", error: error.message });
  }
});

// ---------------------------------------------------------
// 👇 THIS IS THE NEW PART FOR NOTIFICATIONS
// ---------------------------------------------------------

// @route   GET /api/auth/notifications
// @desc    Get user notifications
router.get('/notifications', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notifications');
        // Sort by newest first
        const sorted = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
        res.json(sorted);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

// @route   PUT /api/auth/notifications/read
// @desc    Mark all notifications as read
router.put('/notifications/read', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.notifications.forEach(n => n.isRead = true);
        await user.save();
        res.json(user.notifications);
    } catch (error) {
        res.status(500).json({ message: "Error updating notifications" });
    }
});

module.exports = router;