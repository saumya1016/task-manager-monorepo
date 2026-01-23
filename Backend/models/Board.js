const mongoose = require('mongoose');

const boardSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    // The person who created the board
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    // Friends you invite
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        // ✅ Added 'member' and 'admin' to fix the validation error
        role: { 
            type: String, 
            enum: ['viewer', 'editor', 'member', 'admin'], 
            default: 'member' 
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', boardSchema);