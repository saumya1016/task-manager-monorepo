const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    // Link to Board (The container)
    board: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Board',
    },

    content: { type: String, required: true }, 
    description: { type: String, default: '' }, 
    status: { type: String, required: true, default: 'col-1' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    deadline: { type: Date },
    tag: { type: String, default: 'General' },
    
    // Display Name (For the UI card)
    assignee: { type: String, default: 'Unassigned' },

    // ✅ CRITICAL ADDITION: Link to specific User ID
    // This allows the "My Tasks" page to find tasks for a logged-in user.
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },

    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);