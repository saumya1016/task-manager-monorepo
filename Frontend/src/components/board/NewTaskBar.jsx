import React, { useRef, useEffect } from 'react';
import { Plus, X, Tag, Calendar, Flag, Check } from 'lucide-react';

const NewTaskBar = ({ 
  isCreating, setIsCreating, 
  newTaskContent, setNewTaskContent, 
  newTag, setNewTag, 
  newPriority, setNewPriority, 
  newDeadline, setNewDeadline, 
  handleCreateTask 
}) => {
  const inputRef = useRef(null);

  // Focus input automatically when opened
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  // Submit on Enter (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsCreating(false);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    }
  };

  if (!isCreating) {
    return (
      <button 
        onClick={() => setIsCreating(true)} 
        className="w-full py-2.5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 hover:text-indigo-600 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-xs font-bold mb-4 group"
      >
        <Plus size={14} className="group-hover:scale-110 transition-transform" /> 
        Add New Issue
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-500/40 rounded-xl shadow-xl p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-indigo-500/5">
      
      {/* 1. Content Input - Professional Minimalist */}
      <textarea 
        ref={inputRef}
        placeholder="Issue title..." 
        className="w-full text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent outline-none placeholder:text-zinc-400 resize-none min-h-[40px]"
        value={newTaskContent} 
        onChange={e => setNewTaskContent(e.target.value)} 
        onKeyDown={handleKeyDown}
        rows={1}
      />

      {/* 2. Metadata Controls - Subtle and Clean */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        
        {/* Priority Select */}
        <div className="relative group">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] font-bold uppercase tracking-tight text-zinc-500">
            <Flag size={10} className={
                newPriority === 'High' ? 'text-red-500' : 
                newPriority === 'Medium' ? 'text-orange-500' : 'text-emerald-500'
            } />
            {newPriority}
          </div>
          <select 
            value={newPriority} 
            onChange={(e) => setNewPriority(e.target.value)} 
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Date Select */}
        <div className="relative group">
          <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-md text-[10px] font-bold uppercase tracking-tight ${
            newDeadline 
              ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600' 
              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500'
          }`}>
            <Calendar size={10} />
            {newDeadline ? new Date(newDeadline).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'Set Date'}
          </div>
          <input 
            type="date" 
            value={newDeadline} 
            onChange={(e) => setNewDeadline(e.target.value)} 
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Tag Input */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md w-24">
          <Tag size={10} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Tag" 
            value={newTag} 
            onChange={(e) => setNewTag(e.target.value)} 
            className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-tight w-full text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-400" 
          />
        </div>

        {/* Actions - Right Aligned */}
        <div className="flex items-center gap-1 ml-auto">
          <button 
            onClick={() => setIsCreating(false)} 
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
            title="Cancel"
          >
            <X size={14} />
          </button>
          <button 
            onClick={handleCreateTask} 
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-1"
          >
            <Check size={12} strokeWidth={4} /> Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewTaskBar;