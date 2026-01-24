const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    profilePicture: { type: String, default: '' }, 
    avatar: { type: String, default: 'US' }, 

    // ✅ ADD THESE FOR OTP LOGIC
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },

    notifications: [{
      message: { type: String },
      boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);