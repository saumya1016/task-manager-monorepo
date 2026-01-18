const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'TaskFlow Password Reset',
      html: message,
    });

    res.status(200).json({ message: "Password reset link sent to email." });
  } catch (error) {
    res.status(500).json({ message: "Email could not be sent" });
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

// --- INVITE USER (NEW) ---
// @route   POST /api/auth/invite
router.post('/invite', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Search for user
    const existingUser = await User.findOne({ email });

    // 2. CASE A: User ALREADY exists
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User found",
        user: existingUser, // Send back user info so frontend can add them to board
        isExistingUser: true
      });
    }

    // 3. CASE B: User does NOT exist (Send Invite Email)
    const clientUrl = process.env.CLIENT_URL; 
    const inviteLink = `${clientUrl}/register?email=${email}`;
    
    const html = `
      <h3>You have been invited to TaskFlow!</h3>
      <p>Someone wants to collaborate with you on a board.</p>
      <a href="${inviteLink}" style="padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Join Now</a>
    `;

    await sendEmail({
      to: email,
      subject: "Invitation to join TaskFlow",
      html: html
    });

    return res.status(200).json({
      success: true,
      message: "Invite email sent successfully",
      isExistingUser: false
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during invite" });
  }
});

module.exports = router;