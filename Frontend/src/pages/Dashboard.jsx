import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { 
  Plus, Layout, LogOut, Loader2, Bell, Search, 
  ChevronRight, Settings, User, Menu, X, CheckSquare 
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState([]); 
  const [showNotif, setShowNotif] = useState(false); 
  
  // UI Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [showProfileMenu, setShowProfileMenu] = useState(false); 

  // Refs
  const profileMenuRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchData();
  }, []);

  // Click Outside Listener for Profile Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
            setShowProfileMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const fetchData = async () => {
    try {
      const [boardsRes, notifRes] = await Promise.all([
        axios.get('/boards'),
        axios.get('/auth/notifications')
      ]);
      setBoards(boardsRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) {
        toast.error("Please enter a board name first!");
        return;
    }
    try {
      setIsCreating(true);
      const titleToSend = newBoardTitle || "Untitled Board";
      const { data } = await axios.post('/boards', { title: titleToSend });
      toast.success("Board created!");
      navigate(`/board/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create board");
      setIsCreating(false);
    }
  };

  const markNotificationsRead = async () => {
    if (notifications.some(n => !n.isRead)) {
        try {
            await axios.put('/auth/notifications/read');
            const updated = notifications.map(n => ({ ...n, isRead: true }));
            setNotifications(updated);
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans flex overflow-hidden">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen sticky top-0 z-30">
        <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Layout size={18} strokeWidth={3} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
        </div>

        {/* 1. MAIN NAVIGATION (Work) */}
        <div className="flex-1 px-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 mt-4">Workspace</p>
            
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium transition-colors">
                <Layout size={18} /> Boards
            </button>
            
            {/* ✅ FIXED: Added onClick to My Tasks */}
            <button 
                onClick={() => navigate('/mytasks')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors"
            >
                <CheckSquare size={18} /> My Tasks
            </button>
        </div>

        {/* 2. SIDEBAR FOOTER (Settings & Sign Out) */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
             <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors">
                <Settings size={18} /> Settings
             </button>

             <div className="bg-indigo-50 dark:bg-zinc-800/50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">Pro Plan</h4>
                <p className="text-[10px] text-zinc-500 mb-3">Get unlimited boards.</p>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">
                    Upgrade
                </button>
             </div>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR (Overlay) --- */}
      {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <div className="w-64 h-full bg-white dark:bg-zinc-900 p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="font-bold text-xl">Menu</h2>
                      <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full flex gap-3 p-2 font-medium"><Layout size={18}/> Boards</button>
                    
                    {/* ✅ FIXED: Added onClick to Mobile My Tasks */}
                    <button onClick={() => navigate('/mytasks')} className="w-full flex gap-3 p-2 font-medium">
                        <CheckSquare size={18}/> My Tasks
                    </button>
                    
                    <button onClick={() => navigate('/profile')} className="w-full flex gap-3 p-2 font-medium"><User size={18}/> Profile</button>
                  </div>
                  <button onClick={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} className="mt-auto flex gap-2 text-red-500 font-bold"><LogOut /> Sign Out</button>
              </div>
          </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-zinc-50/50 dark:bg-black/5">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-white hidden sm:block">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                 {/* Search Bar */}
                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-transparent focus-within:border-indigo-500/30 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                    <Search size={14} className="text-zinc-400" />
                    <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-zinc-400" />
                </div>

                {/* Notification Bell */}
                <div className="relative">
                    <button 
                        onClick={() => { setShowNotif(!showNotif); if (!showNotif) markNotificationsRead(); }}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
                    >
                        <Bell size={20} className="text-zinc-500 dark:text-zinc-400" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                        )}
                    </button>
                    {showNotif && (
                        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                                <h3 className="text-xs font-bold uppercase text-zinc-500">Notifications</h3>
                                <button onClick={() => setShowNotif(false)} className="text-xs text-indigo-500">Close</button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? <p className="p-4 text-center text-sm text-zinc-500">No new notifications</p> : 
                                    notifications.map((n, i) => (
                                        <div key={i} className={`p-3 border-b border-zinc-100 dark:border-zinc-800 text-sm ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>{n.message}</div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>

                {/* Dropdown Avatar */}
                <div className="relative" ref={profileMenuRef}>
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:ring-2 hover:ring-indigo-500/20 transition-all focus:outline-none"
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 top-12 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                            </div>
                            <div className="p-2 space-y-1">
                                <button 
                                    onClick={() => navigate('/profile')}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-left font-medium"
                                >
                                    <User size={16} /> My Profile
                                </button>
                                <button 
                                    onClick={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} 
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left font-medium"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome back, {user?.name.split(' ')[0]}!</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Here are your active workspaces.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create Card */}
                <form 
                    onSubmit={handleCreateBoard} 
                    className="group h-48 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                >
                    {isCreating ? <Loader2 className="animate-spin text-indigo-600" /> : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={24} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Create New Board" 
                                className="text-center bg-transparent outline-none text-sm font-semibold text-zinc-600 dark:text-zinc-300 placeholder:text-zinc-400 w-full px-4 z-10"
                                value={newBoardTitle}
                                onChange={(e) => setNewBoardTitle(e.target.value)}
                            />
                            <button type="submit" className="hidden" />
                        </>
                    )}
                </form>

                {/* Boards List */}
                {boards.map((board) => (
                    <div 
                        key={board._id} 
                        onClick={() => navigate(`/board/${board._id}`)}
                        className="group h-48 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{board.title}</h3>
                                {board.owner === user._id && <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Owner</span>}
                            </div>
                            <p className="text-xs text-zinc-400">Updated {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] text-white font-bold">OW</div>
                                {board.members.length > 0 && <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold">+{board.members.length}</div>}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;