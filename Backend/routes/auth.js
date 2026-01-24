const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/s3Config'); // 👈 1. Import S3 Config Utility

// Import Controller functions
const {
    signupUser,
    loginUser,
    googleSync,
    getNotifications,
    markNotificationsRead,
    updateProfilePicture // 👈 2. Import the new DP controller
} = require('../controllers/authController');

// --- Standard Routes ---
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/google-sync', googleSync);

// --- Profile Routes ---
// ✅ 3. Add the PUT route for DP. 
// 'image' must match the key used in Frontend FormData.
router.put('/update-dp', protect, upload.single('image'), updateProfilePicture);

// --- Notification Routes ---
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;