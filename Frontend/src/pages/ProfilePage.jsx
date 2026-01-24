import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Clock, 
  Camera, LogOut, Activity, Settings, Zap, Mail, ChevronRight, Lock, Users, Trash2, ShieldCheck, XCircle
} from 'lucide-react';
import axios from '../utils/axios'; 
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, efficiency: '0%' });
  const [joinedBoards, setJoinedBoards] = useState([]); 
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [leavingId, setLeavingId] = useState(null); // ✅ NEW: Track which workspace is in "Leave?" state

  const user = JSON.parse(sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/tasks/stats');
        setStats(data);
      } catch (error) { console.error("Failed to fetch stats", error); }
    };
    fetchStats();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'workspaces') {
      fetchWorkspaces();
    }
  }, [activeTab]);

  const fetchWorkspaces = async () => {
    setLoadingBoards(true);
    try {
      const { data } = await axios.get('/boards'); 
      setJoinedBoards(data);
    } catch (error) {
      toast.error("Failed to load workspaces");
    } finally {
      setLoadingBoards(false);
    }
  };

  // ✅ UPDATED: Professional Inline Leave logic
  const handleLeaveBoard = async (boardId) => {
    try {
      await axios.post(`/boards/${boardId}/leave`);
      setJoinedBoards(prev => prev.filter(b => b._id !== boardId));
      toast.success("Departure Successful", { description: "You have left the workspace." });
    } catch (error) {
      toast.error("Error leaving workspace");
    } finally {
      setLeavingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans text-zinc-900 selection:bg-indigo-100">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-6 z-20">
        <button onClick={() => navigate('/dashboard')} className="group flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-indigo-600 transition-all mb-10 active:scale-95">
          <div className="p-2 rounded-lg bg-white border border-gray-200 group-hover:border-indigo-200 transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform"/>
          </div>
          Dashboard
        </button>

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 p-0.5 shadow-xl mb-4">
            <div className="w-full h-full rounded-[1.1rem] bg-white flex items-center justify-center text-2xl font-black text-indigo-600 uppercase">
              {user.name?.charAt(0)}
            </div>
          </div>
          <h2 className="text-base font-bold tracking-tight text-zinc-800 line-clamp-1">{user.name}</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 italic">Verified Account</p>
        </div>

        <nav className="space-y-1.5 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity size={18}/> },
            { id: 'workspaces', label: 'My Teams', icon: <Users size={18}/> },
            { id: 'settings', label: 'Settings', icon: <Settings size={18}/> }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                : 'text-zinc-500 hover:bg-white hover:shadow-sm border border-transparent'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate('/login'); }} 
          className="mt-auto flex items-center justify-center gap-2.5 p-3.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-10 overflow-y-auto bg-white relative">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="md:col-span-3 bg-indigo-600 p-10 rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-indigo-100 text-white italic">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user.name.split(' ')[0]}.</h1>
                <p>You've completed <span className="font-black underline">{stats.completed} tasks</span> across your workspaces.</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center shadow-md">
                <div className="relative w-24 h-24 mb-4 text-indigo-600 flex items-center justify-center">
                  <span className="text-xl font-black">{stats.efficiency}</span>
                </div>
                <span className="text-[11px] font-bold uppercase text-zinc-400">Efficiency</span>
              </div>
            </div>
          )}

          {activeTab === 'workspaces' && (
            <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
              <header>
                <h2 className="text-3xl font-black tracking-tight text-zinc-800 italic">Workspaces & Teams</h2>
                <p className="text-zinc-500 text-base font-medium">Manage the environments you collaborate in.</p>
              </header>

              <div className="space-y-4">
                {loadingBoards ? (
                  <div className="p-20 text-center"><Zap className="animate-pulse mx-auto text-indigo-500" /></div>
                ) : joinedBoards.length === 0 ? (
                  <div className="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">No workspaces found.</div>
                ) : (
                  joinedBoards.map((board) => (
                    <div key={board._id} className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg shadow-inner uppercase">
                            {board.title.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-800 flex items-center gap-2 text-lg">
                              {board.title}
                              {board.owner === user._id && <ShieldCheck size={14} className="text-indigo-500" />}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-black uppercase text-zinc-400">
                              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{board.members?.length || 1} Members</span>
                              <span>•</span>
                              <span className={board.owner === user._id ? "text-indigo-500" : "text-zinc-400"}>
                                {board.owner === user._id ? "Administrator" : "Collaborator"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => navigate(`/workspace/${board._id}/manage`)}
                            className="px-4 py-2 bg-zinc-100 hover:bg-indigo-50 text-zinc-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                          >
                            <Users size={14}/>
                            Manage Team
                          </button>
                          
                          <button onClick={() => navigate(`/board/${board._id}`)} className="px-4 py-2 bg-white border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-zinc-900">
                            Open Board
                          </button>
                          
                          {/* ✅ UPDATED: Professional Inline Confirmation for Leaving */}
                          {board.owner !== user._id && (
                            <div className="flex items-center gap-2">
                              {leavingId === board._id ? (
                                <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                                  <button 
                                    onClick={() => handleLeaveBoard(board._id)}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95"
                                  >
                                    Confirm
                                  </button>
                                  <button 
                                    onClick={() => setLeavingId(null)}
                                    className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setLeavingId(board._id)} 
                                  className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group" 
                                  title="Leave Workspace"
                                >
                                  <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
               <header>
                <h2 className="text-3xl font-black tracking-tight text-zinc-800 italic">Settings</h2>
                <p className="text-zinc-500 text-base font-medium">Update your account information.</p>
              </header>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-lg space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Email Key (Read Only)</label>
                  <div className="w-full bg-gray-100 border border-gray-200 p-4 rounded-2xl text-zinc-500 text-sm font-bold flex items-center gap-3">
                    <Mail size={16}/> {user.email}
                  </div>
                </div>
                <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all">
                  Save Security Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ProfilePage;