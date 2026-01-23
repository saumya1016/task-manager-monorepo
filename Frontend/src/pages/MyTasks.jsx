import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { CheckCircle, Clock, ArrowRight, Calendar, Layout, ChevronRight } from 'lucide-react';

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchMyTasks(); }, []);

  const fetchMyTasks = async () => {
    try {
      const { data } = await axios.get('/tasks/my-tasks'); 
      setTasks(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-500 font-black uppercase tracking-widest text-xs">Syncing Workspace...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl">
        
        {/* Focused Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Personal Focus</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">My Tasks</h1>
          </div>
          
          <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-sm">
            {['all', 'pending', 'completed'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* High-Density List */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-20 text-center">
              <CheckCircle size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" strokeWidth={1} />
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Inbox Zero. You're clear.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {tasks.map((task) => (
                <div key={task._id} className="group flex items-center px-8 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all cursor-default">
                  
                  {/* Status Indicator */}
                  <div className="mr-6 text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-500 transition-colors">
                    <CheckCircle size={20} strokeWidth={3} />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-zinc-400">
                        <Layout size={10}/> {task.boardTitle}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'text-red-500' : 'text-zinc-400'}`}>
                         <div className={`w-1 h-1 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-zinc-400'}`} />
                         {task.priority || 'Normal'}
                      </div>
                    </div>
                  </div>

                  {/* Date & Link */}
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Due Date</span>
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <button onClick={() => navigate(`/board/${task.boardId}`)} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all scale-90 group-hover:scale-100">
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