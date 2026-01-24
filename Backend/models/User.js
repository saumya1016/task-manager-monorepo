const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // ✅ Updated for S3 Support
    profilePicture: { type: String, default: '' }, 
    avatar: { type: String, default: 'US' }, 

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