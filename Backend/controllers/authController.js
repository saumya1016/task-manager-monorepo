const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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
            profilePicture: user.profilePicture, // ✅ Added for S3
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
                profilePicture: user.profilePicture, // ✅ Added for S3
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Profile Picture
// @route   PUT /api/auth/update-dp
const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        // req.file.location is the S3 URL provided by multer-s3
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
            profilePicture: user.profilePicture, // ✅ Added
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
    updateProfilePicture // ✅ Exported
};