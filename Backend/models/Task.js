const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    // THIS IS THE FIX: Link the task to a specific User ID
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: { type: String, required: true }, 
    description: { type: String, default: '' }, 
    status: { type: String, required: true, default: 'col-1' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    deadline: { type: Date },
    tag: { type: String, default: 'General' },
    assignee: { type: String, default: 'Unassigned' },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);