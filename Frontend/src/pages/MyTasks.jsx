import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { CheckCircle, ArrowRight, Layout, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchMyTasks(); }, []);

  const fetchMyTasks = async () => {
    try {
      const { data } = await axios.get('/tasks/my-tasks'); 
      setTasks(data);
    } catch (error) { 
      toast.error("Failed to sync workspace");
    } finally { 
      setLoading(false); 
    }
  };

  // LOGIC: Toggle task status directly from the list
  const toggleStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'DONE' ? 'IN_PROGRESS' : 'DONE';
    try {
      // Optimistic Update: Change UI immediately
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await axios.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      toast.error("Update failed");
      fetchMyTasks(); // Revert on error
    }
  };

  // LOGIC: High-performance filtering and searching
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (filter === 'completed') return matchesSearch && task.status === 'DONE';
      if (filter === 'pending') return matchesSearch && task.status !== 'DONE';
      return matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
      <div className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Syncing Workspace...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Personal Focus</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">My Tasks</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full sm:w-64 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search size={14} className="text-zinc-400" />
              <input 
                type="text" 
                placeholder="Find a task..." 
                className="bg-transparent border-none outline-none text-xs w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-sm">
              {['all', 'pending', 'completed'].map((f) => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Task List Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-zinc-300 dark:text-zinc-700" strokeWidth={1} />
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No tasks found. Enjoy the quiet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {filteredTasks.map((task) => (
                <div key={task._id} className="group flex items-center px-8 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all">
                  
                  {/* Status Toggle Button */}
                  <button 
                    onClick={() => toggleStatus(task._id, task.status)}
                    className={`mr-6 transition-all duration-300 ${task.status === 'DONE' ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-indigo-500'}`}
                  >
                    <CheckCircle size={22} strokeWidth={task.status === 'DONE' ? 3 : 2} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold transition-all duration-300 ${task.status === 'DONE' ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-zinc-400">
                        <Layout size={10}/> {task.boardTitle || 'Untitled Board'}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'text-red-500' : 'text-zinc-400'}`}>
                         <div className={`w-1 h-1 rounded-full ${task.priority === 'High' ? 'bg-red-500 animate-pulse' : 'bg-zinc-400'}`} />
                         {task.priority || 'Normal'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end opacity-60">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Deadline</span>
                      <span className="text-[11px] font-bold">{task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Open'}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/board/${task.boardId}`)} 
                      className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all group-hover:translate-x-1"
                    >
                      <ArrowRight size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;