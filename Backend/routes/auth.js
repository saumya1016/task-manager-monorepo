const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/s3Config');

// Import Controller functions
const {
    signupUser,
    loginUser,
    googleSync,
    getNotifications,
    markNotificationsRead,
    updateProfilePicture,
    updateProfile, 
    forgotPassword, 
    resetPassword
} = require('../controllers/authController');

// --- Standard Routes ---
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/google-sync', googleSync);

// --- Password Reset Routes ---
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// --- Profile Routes ---
// fix the "Cannot PUT /api/auth/update-profile" error
router.put('/update-profile', protect, updateProfile); 

// 'image' must match the key used in Frontend FormData.
router.put('/update-dp', protect, upload.single('image'), updateProfilePicture);

// --- Notification Routes ---
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;