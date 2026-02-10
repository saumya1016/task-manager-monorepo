const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Update User Profile (Name)
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // Update name if provided in request body
            user.name = req.body.name || user.name;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// @desc    Signup user
const signupUser = async (req, res) => {
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
            profilePicture: user.profilePicture, 
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                profilePicture: user.profilePicture, 
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Step 1: Forgot Password - Send OTP
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate 6-digit random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to DB with 10-minute expiry
        user.resetOTP = otp;
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { 
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS 
            }
        });

        await transporter.sendMail({
            from: `"TaskFlow Security" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Your Password Reset Code",
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4f46e5;">Verification Code</h2>
                    <p>Enter this code to reset your TaskFlow password. It expires in 10 minutes.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #1e293b;">${otp}</span>
                    </div>
                </div>`
        });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Step 2: Reset Password - Verify OTP
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            resetOTP: otp, 
            resetOTPExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Profile Picture
const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: req.file.location },
            { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Database update failed", error: error.message });
    }
};

// @desc    Google Sync
const googleSync = async (req, res) => {
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
            profilePicture: user.profilePicture, 
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Google Sync failed", error: error.message });
    }
};

// @desc    Get notifications
const getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notifications');
        const sorted = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
        res.json(sorted);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// @desc    Mark notifications as read
const markNotificationsRead = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.notifications.forEach(n => n.isRead = true);
        await user.save();
        res.json(user.notifications);
    } catch (error) {
        res.status(500).json({ message: "Error updating notifications" });
    }
};

module.exports = {
    signupUser,
    loginUser,
    googleSync,
    getNotifications,
    markNotificationsRead,
    updateProfilePicture,
    updateProfile, 
    forgotPassword,
    resetPassword
};