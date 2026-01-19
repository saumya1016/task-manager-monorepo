import React, { useState } from 'react';
import { X, ChevronDown, Clock, Send, AlignLeft, User, Check } from 'lucide-react';

const EditTaskModal = ({ task, onClose, onSave, members }) => { // <--- Added 'members' prop
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'comments'
  
  // Form State
  const [content, setContent] = useState(task.content);
  const [description, setDescription] = useState(task.description || ''); 
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.split('T')[0] : '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo?._id || task.assignedTo || ''); // <--- Added State

  // Comments State (Mock Data)
  const [comments, setComments] = useState([
    { id: 1, user: 'System', text: 'Task created.', time: '2h ago' },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass 'assignedTo' back to the parent
    onSave({ id: task.id, content, description, priority, deadline, assignedTo }); 
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment = { 
        id: Date.now(), 
        user: 'You', 
        text: newComment, 
        time: 'Just now' 
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-lg flex flex-col max-h-[90dvh] animate-in zoom-in duration-200 overflow-hidden">
        
        {/* --- Header & Tabs --- */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
           <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('details')}
                className={`text-sm font-medium pb-1 transition-colors border-b-2 ${activeTab === 'details' ? 'text-indigo-600 dark:text-white border-indigo-600' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-300'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab('comments')}
                className={`text-sm font-medium pb-1 transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'comments' ? 'text-indigo-600 dark:text-white border-indigo-600' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-300'}`}
              >
                Comments <span className="bg-gray-100 dark:bg-zinc-800 text-xs px-1.5 py-0.5 rounded-full">{comments.length}</span>
              </button>
           </div>
           
           <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors p-1">
             <X size={20} />
           </button>
        </div>
        
        {/* --- Scrollable Content --- */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB: DETAILS */}
          {activeTab === 'details' && (
            <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Task Title</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Description</label>
                <div className="relative">
                    <textarea 
                      className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none min-h-[120px] resize-none pl-9 leading-relaxed" 
                      placeholder="Add a more detailed description..."
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                    />
                    <AlignLeft size={16} className="absolute left-3 top-3 text-zinc-400" />
                </div>
              </div>

              {/* --- NEW: ASSIGN TO MEMBER --- */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Assign To</label>
                <div className="relative">
                    <select 
                        value={assignedTo} 
                        onChange={(e) => setAssignedTo(e.target.value)} 
                        className="w-full appearance-none bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="">Unassigned</option>
                        {members && members.map((m) => (
                            <option key={m._id} value={m._id}>
                                {m.name} ({m.email})
                            </option>
                        ))}
                    </select>
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Meta Data (Priority & Date) */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Priority</label>
                  <div className="relative">
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value)} 
                      className="w-full appearance-none bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Deadline</label>
                  <input 
                    type="date" 
                    value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)} 
                    className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">No activity yet.</div>
                ) : (
                    comments.map(c => (
                        <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                                {c.user.charAt(0)}
                            </div>
                            <div className="space-y-1 w-full">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">{c.user}</span>
                                    <span className="text-xs text-zinc-400 flex items-center gap-1"><Clock size={10}/> {c.time}</span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-r-xl rounded-bl-xl border border-gray-100 dark:border-zinc-700/50">
                                    {c.text}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
          )}
        </div>

        {/* --- Footer (Sticky) --- */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-sm shrink-0">
           {activeTab === 'details' ? (
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
                    <button form="edit-form" type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">Save Changes</button>
                </div>
           ) : (
                <form onSubmit={handleAddComment} className="relative">
                    <input 
                        type="text" 
                        placeholder="Write a comment..." 
                        className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-4 pr-12 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
           )}
        </div>

      </div>
    </div>
  );
};

export default EditTaskModal;