import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { 
  Plus, Layout, LogOut, Loader2, Bell, Search, 
  ChevronRight, Settings, User, Menu, X, CheckSquare, Trash2, AlertTriangle, MessageSquareHeart, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns'; // ✅ Added for accurate time

const Dashboard = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(false); 

  // ✅ Search Query state preserved
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications, setNotifications] = useState([]); 
  const [showNotif, setShowNotif] = useState(false); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [showProfileMenu, setShowProfileMenu] = useState(false); 

  // ✅ Delete Modal States preserved
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const profileMenuRef = useRef(null);
  
  // ✅ Check both sessionStorage and localStorage for multi-account fix
  const user = JSON.parse(sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
            setShowProfileMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // ✅ Filter logic preserved
  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) {
        setError(true);
        toast.error("Workspace name is required!");
        return;
    }
    try {
      setIsCreating(true);
      setError(false);
      const { data } = await axios.post('/boards', { title: newBoardTitle });
      toast.success("Board created!");
      navigate(`/board/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create board");
      setIsCreating(false);
    }
  };

  const openDeleteModal = (e, board) => {
    e.stopPropagation();
    setBoardToDelete(board);
    setShowDeleteModal(true);
  };

  const handleFinalDelete = async () => {
    if (confirmText !== 'DELETE') return;
    try {
      setIsDeleting(true);
      await axios.delete(`/boards/${boardToDelete._id}`);
      setBoards(boards.filter(b => b._id !== boardToDelete._id));
      toast.success("Workspace permanently removed");
      closeDeleteModal();
    } catch (error) {
      toast.error("Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBoardToDelete(null);
    setConfirmText('');
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans flex overflow-hidden transition-colors duration-500">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen sticky top-0 z-30">
        <div className="p-8 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Layout size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black tracking-tighter">TaskFlow</h1>
        </div>

        <div className="flex-1 px-4 space-y-1">
            <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 mt-2">Menu</p>
            
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold transition-all">
                <Layout size={18} /> Boards
            </button>
            
            <button onClick={() => navigate('/mytasks')} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm font-bold transition-all">
                <CheckSquare size={18} /> My Tasks
            </button>

            <button onClick={() => navigate('/feedback')} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm font-bold transition-all group">
                <MessageSquareHeart size={18} className="group-hover:text-pink-500 transition-colors" /> Feedback
            </button>
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
             <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl text-sm font-bold transition-all">
                <Settings size={18} /> Settings
             </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto relative bg-zinc-50/50 dark:bg-zinc-950">
        
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 hover:bg-zinc-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={20}/></button>
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 hidden sm:block">Dashboard</h2>
            </div>

            <div className="flex items-center gap-5">
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-transparent focus-within:border-indigo-500/20 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all">
                    <Search size={15} className="text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search workspaces..." 
                      className="bg-transparent border-none outline-none text-sm w-56 placeholder:text-zinc-400 font-medium" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* NOTIFICATIONS DROPDOWN */}
                <div className="relative">
                    <button 
                        onClick={() => { setShowNotif(!showNotif); if (!showNotif) markNotificationsRead(); }} 
                        className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all relative group"
                    >
                        <Bell size={20} className="text-zinc-500 group-hover:text-indigo-600 transition-colors" />
                        {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />}
                    </button>
                    
                    {showNotif && (
                        <div className="absolute right-0 top-14 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Notifications</h3>
                                <button onClick={() => setShowNotif(false)} className="text-[10px] font-black text-indigo-500 uppercase hover:underline">Close</button>
                            </div>
                            <div className="max-h-72 overflow-y-auto p-2">
                                {notifications.length === 0 ? (
                                    <p className="p-6 text-center text-xs font-bold text-zinc-400 italic">No new alerts</p>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={i} className={`p-4 rounded-xl mb-1 transition-all ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                            <p className={`text-xs font-bold ${!n.isRead ? 'text-indigo-900 dark:text-indigo-200' : 'text-zinc-500'}`}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
                                                <Clock size={10} />
                                                {/* ✅ Accurate Time Display */}
                                                {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markNotificationsRead}
                                    className="w-full py-3 bg-zinc-50 dark:bg-zinc-800/50 text-[9px] font-black uppercase tracking-widest text-indigo-500 border-t border-zinc-100 dark:border-zinc-800 hover:bg-indigo-50 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* PROFILE MENU */}
                <div className="relative" ref={profileMenuRef}>
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="w-10 h-10 rounded-xl bg-indigo-600 border border-white/10 flex items-center justify-center text-sm font-black text-white hover:ring-4 hover:ring-indigo-500/10 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </button>
                    
                    {showProfileMenu && (
                        <div className="absolute right-0 top-14 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50">
                                <p className="text-sm font-black text-zinc-900 dark:text-white truncate tracking-tight">{user?.name}</p>
                                <p className="text-[10px] font-bold text-zinc-400 truncate">{user?.email}</p>
                            </div>
                            <div className="p-2">
                                <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all">
                                    <User size={16} /> Profile
                                </button>
                                <button onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        <div className="max-w-6xl mx-auto px-10 py-12">
            <div className="mb-10 text-left">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Workspaces</h1>
                <p className="text-sm font-medium text-zinc-400 mt-2 italic">Select a board to view your progress.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <form 
                    onSubmit={handleCreateBoard} 
                    className={`group h-56 bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden shadow-sm
                    ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10 animate-bounce-short' : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/10'}`}
                >
                    {isCreating ? <Loader2 className="animate-spin text-indigo-600" /> : (
                        <>
                            <button type="submit" className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 shadow-lg ${error ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                                <Plus size={28} strokeWidth={3} />
                            </button>
                            <input 
                                type="text" 
                                placeholder={error ? "Title Required!" : "New Board Name"} 
                                className={`text-center bg-transparent outline-none text-sm font-black w-full px-6 z-10 uppercase tracking-widest ${error ? 'text-red-600 placeholder:text-red-500' : 'text-zinc-400 placeholder:text-zinc-300 focus:text-zinc-900'}`} 
                                value={newBoardTitle} 
                                onChange={(e) => {
                                    setNewBoardTitle(e.target.value);
                                    if(error) setError(false); 
                                }} 
                            />
                        </>
                    )}
                </form>

                {filteredBoards.map((board) => (
                    <div key={board._id} onClick={() => navigate(`/board/${board._id}`)} className="group h-56 bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between relative">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-black text-xl text-zinc-900 dark:text-white truncate pr-2 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{board.title}</h3>
                                {board.owner === user?._id && (
                                  <button 
                                    onClick={(e) => openDeleteModal(e, board)}
                                    className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                              {board.owner === user?._id && <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">Owner</span>}
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Updated {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 border-4 border-white dark:border-zinc-900 flex items-center justify-center text-xs text-white font-black shadow-sm uppercase">{user?.name?.charAt(0)}</div>
                                {board.members?.length > 0 && <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-black shadow-sm">+{board.members.length}</div>}
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-12 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8"><AlertTriangle size={32} /></div>
            <h2 className="text-2xl font-black text-center tracking-tighter mb-2 italic">Destructive Action</h2>
            <p className="text-zinc-500 text-center text-xs mb-8 font-medium">Type <span className="text-red-600 font-black">DELETE</span> to wipe <span className="text-zinc-900 dark:text-white font-black italic">"{boardToDelete?.title}"</span>.</p>
            <input 
              type="text" 
              placeholder="CONFIRMATION" 
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl text-center font-black tracking-widest text-sm outline-none focus:ring-4 ring-red-500/10 transition-all mb-6" 
              value={confirmText} 
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())} 
            />
            <div className="flex flex-col gap-3">
              <button 
                disabled={confirmText !== 'DELETE' || isDeleting} 
                onClick={handleFinalDelete} 
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-100 disabled:text-zinc-300 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-500/20"
              >
                {isDeleting ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Purge Workspace"}
              </button>
              <button onClick={closeDeleteModal} className="w-full py-4 text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:text-zinc-900 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;