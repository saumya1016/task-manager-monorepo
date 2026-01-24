const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Board',
      index: true, // ✅ SPEED UP: Fast deletions when a board is deleted
    },

    content: { type: String, required: true }, 
    description: { type: String, default: '' }, 
    status: { type: String, required: true, default: 'col-1' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    deadline: { type: Date },
    tag: { type: String, default: 'General' },
    
    assignee: { type: String, default: 'Unassigned' },

    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      index: true, // ✅ SPEED UP: Fast lookups for the "My Tasks" page
    },

    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);