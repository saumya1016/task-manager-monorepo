import React, { useState } from 'react';
import { X, Calendar, User, Tag, AlignLeft, Flag } from 'lucide-react';

const EditTaskModal = ({ task, members = [], userRole, onClose, onSave }) => {
  const [content, setContent] = useState(task.content);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.split('T')[0] : '');
  const [tag, setTag] = useState(task.tag || '');
  const [assigneeId, setAssigneeId] = useState(task.assignedTo || '');

  // Permission: Viewers cannot save or edit fields
  const isViewer = userRole === 'viewer';

  const handleSubmit = () => {
    if (isViewer) return; // Guard clause

    const selectedMember = members.find(m => m._id === assigneeId);
    const assigneeName = selectedMember ? selectedMember.name : (assigneeId ? 'Unknown' : 'Unassigned');

    onSave({
      id: task.id,
      content, description, priority, deadline, tag,
      assignedTo: assigneeId,
      assignee: assigneeName
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold dark:text-white">{isViewer ? 'Task Details' : 'Edit Task'}</h2>
          <button onClick={onClose}><X size={18} className="text-zinc-500" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Task Title</label>
            <input 
              type="text" 
              disabled={isViewer}
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full text-lg font-semibold bg-transparent border-b border-gray-200 dark:border-zinc-700 focus:border-indigo-500 outline-none py-1 dark:text-white disabled:opacity-70" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Priority */}
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><Flag size={12}/> Priority</label>
                <select 
                  disabled={isViewer}
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white disabled:cursor-not-allowed"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
             </div>

             {/* Assignee */}
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><User size={12}/> Assign To</label>
                <select 
                  disabled={isViewer}
                  value={assigneeId} 
                  onChange={(e) => setAssigneeId(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white disabled:cursor-not-allowed"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Due Date</label>
                <input 
                  type="date" 
                  disabled={isViewer}
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white disabled:opacity-70" 
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><Tag size={12}/> Tag</label>
                <input 
                  type="text" 
                  disabled={isViewer}
                  value={tag} 
                  onChange={(e) => setTag(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white disabled:opacity-70" 
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><AlignLeft size={12}/> Description</label>
            <textarea 
              rows={4} 
              disabled={isViewer}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none resize-none dark:text-white disabled:opacity-70" 
            />
          </div>

          {/* HIDE Save button for Viewers */}
          {!isViewer && (
            <div className="flex justify-end pt-4">
              <button onClick={handleSubmit} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;