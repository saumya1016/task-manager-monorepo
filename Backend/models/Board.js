const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // The Admin/Creator (Full Control)
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // The Invited Users (Can edit tasks)
  members: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],

  // Your existing columns structure
  columns: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      taskIds: [{ type: String }],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);