import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Clock, 
  Camera, LogOut, Activity, Settings, Zap, Mail, ChevronRight, Lock, Users, Trash2, ShieldCheck, XCircle, User, Copy
} from 'lucide-react';
import axios from '../utils/axios'; 
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, efficiency: '0%' });
  const [joinedBoards, setJoinedBoards] = useState([]); 
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [leavingId, setLeavingId] = useState(null);

  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [formData, setFormData] = useState({ name: user?.name || '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // Copy to Clipboard Helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  useEffect(() => {
    if (user && !formData.name) {
      setFormData({ name: user.name });
    }
  }, [user]);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('image', file);
    const loadingToast = toast.loading("Uploading image to cloud...");
    try {
      const { data } = await axios.put('/auth/update-dp', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = { ...user, profilePicture: data.profilePicture };
      setUser(updatedUser);
      sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      toast.success("Profile picture updated", { id: loadingToast });
    } catch (err) {
      toast.error("Upload failed.", { id: loadingToast });
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) return toast.error("Name cannot be empty");
    setIsUpdating(true);
    try {
      const { data } = await axios.put('/auth/update-profile', formData);
      const updatedUser = { ...user, name: data.name };
      setUser(updatedUser);
      sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeaveBoard = async (boardId) => {
    try {
      await axios.post(`/boards/${boardId}/leave`);
      setJoinedBoards(prev => prev.filter(b => b._id !== boardId));
      toast.success("Departure Successful");
    } catch (error) {
      toast.error("Error leaving workspace");
    } finally {
      setLeavingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans text-zinc-900 selection:bg-indigo-100">
      
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-6 z-20">
        <button onClick={() => navigate('/dashboard')} className="group flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-indigo-600 transition-all mb-10 active:scale-95">
          <div className="p-2 rounded-lg bg-white border border-gray-200 group-hover:border-indigo-200 transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform"/>
          </div>
          Dashboard
        </button>

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 p-0.5 shadow-xl mb-4 overflow-hidden border border-zinc-200/50">
              {user.profilePicture ? (
                <img src={user.profilePicture} className="w-full h-full object-cover rounded-[1.1rem]" alt="Profile" />
              ) : (
                <div className="w-full h-full rounded-[1.1rem] bg-white flex items-center justify-center text-2xl font-black text-indigo-600 uppercase">
                  {user.name?.charAt(0)}
                </div>
              )}
            </div>
            <label className="absolute inset-0 w-20 h-20 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mb-4">
              <Camera className="text-white" size={20} />
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </label>
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

      <main className="flex-1 p-10 overflow-y-auto bg-white relative">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 italic">
                  Hello, {user.name.split(' ')[0]} <span className="not-italic">👋</span>
                </h1>
                <p className="text-zinc-500 font-medium text-lg">Here's a snapshot of your productivity today.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md mb-6"><Zap size={24} className="fill-white text-white" /></div>
                    <div>
                      <h3 className="text-white/80 uppercase text-[10px] font-black tracking-[0.2em] mb-2">Total Impact</h3>
                      <p className="text-4xl font-bold leading-tight italic">
                        You've crushed <span className="underline decoration-indigo-300 underline-offset-8">{stats.completed} tasks</span>
                        <br /> across all workspaces.
                      </p>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-50 flex flex-col items-center justify-center text-center group hover:border-indigo-100 transition-colors">
                  <div className="relative mb-4 flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (parseInt(stats.efficiency) / 100) * 364.4} className="text-indigo-600 transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-zinc-900 leading-none">{stats.efficiency}</span>
                      <span className="text-[9px] font-black uppercase text-zinc-400 mt-1 tracking-tighter">Score</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-800 italic">Work Efficiency</h4>
                </div>

                <div className="bg-zinc-50 rounded-[2rem] p-6 border border-zinc-100 flex items-center gap-5">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl"><CheckCircle size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Completed</p>
                    <p className="text-2xl font-black text-zinc-800 leading-none">{stats.completed}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-[2rem] p-6 border border-zinc-100 flex items-center gap-5">
                  <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><Clock size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">In Progress</p>
                    <p className="text-2xl font-black text-zinc-800 leading-none">{stats.inProgress || 0}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-[2rem] p-6 border border-zinc-100 flex items-center gap-5">
                  <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><Users size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Team Role</p>
                    <p className="text-2xl font-black text-zinc-800 leading-none">Creator</p>
                  </div>
                </div>
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
                            onClick={() => copyToClipboard(`${window.location.origin}/board/${board._id}`, "Board Invite")}
                            className="p-2.5 text-zinc-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Copy Invite Link"
                          >
                            <Copy size={18} />
                          </button>

                          <button onClick={() => navigate(`/workspace/${board._id}/manage`)} className="px-4 py-2 bg-zinc-100 hover:bg-indigo-50 text-zinc-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            <Users size={14}/> Manage Team
                          </button>
                          <button onClick={() => navigate(`/board/${board._id}`)} className="px-4 py-2 bg-white border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-zinc-900">
                            Open Board
                          </button>
                          {board.owner !== user._id && (
                            <div className="flex items-center gap-2">
                              {leavingId === board._id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleLeaveBoard(board._id)} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95">Confirm</button>
                                  <button onClick={() => setLeavingId(null)} className="p-2 text-zinc-400 hover:text-zinc-900"><XCircle size={18} /></button>
                                </div>
                              ) : (
                                <button onClick={() => setLeavingId(board._id)} className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group">
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

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
              <header>
                <h2 className="text-3xl font-black tracking-tight text-zinc-800 italic">Settings</h2>
                <p className="text-zinc-500 text-base font-medium">Update your account information.</p>
              </header>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-lg space-y-8">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Display Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={18}/>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 rounded-2xl text-zinc-800 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Email Address (Primary)</label>
                  <div className="w-full bg-gray-100 border border-gray-200 p-4 rounded-2xl text-zinc-400 text-sm font-bold flex items-center gap-3 cursor-not-allowed">
                    <Mail size={16}/> {user.email}
                    <Lock size={14} className="ml-auto opacity-50" />
                  </div>
                </div>

                <button 
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Processing..." : "Save Security Changes"}
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