import React from 'react';
import { ArrowLeft, Layout, Search, Filter, Sun, Moon, UserPlus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BoardNavbar = ({ 
  boardTitle, isViewer, isDarkMode, setIsDarkMode, 
  searchQuery, setSearchQuery, priorityFilter, setPriorityFilter, 
  onInvite, currentUser,
  /* ✅ ADDED PROPS */
  userRole, onLeave 
}) => {
  const navigate = useNavigate();

  return (
    <nav className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 sticky top-0 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-xl z-20 transition-colors duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Layout size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-zinc-900 dark:text-white truncate max-w-[150px] md:max-w-none">
          {boardTitle}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-4 md:gap-6">
        {/* Search & Filter */}
        <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-full border border-transparent dark:border-zinc-800 focus-within:bg-white dark:focus-within:bg-black focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-sm">
          <div className="relative group pl-3 flex items-center gap-2">
            <Search className="text-zinc-400 dark:text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="bg-transparent border-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 outline-none w-20 md:w-48" 
            />
          </div>
          <div className="h-5 w-[1px] bg-gray-300 dark:bg-zinc-700 mx-1"></div>
          <div className="relative pr-1">
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)} 
              className="bg-transparent border-none text-xs font-semibold text-zinc-600 dark:text-zinc-300 outline-none appearance-none cursor-pointer pl-2 pr-7 py-1"
            >
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <Filter size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Theme Toggle */}
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Invite Button */}
        {!isViewer && (
          <button 
            onClick={onInvite} 
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95"
          >
            <UserPlus size={16} /> 
            <span className="hidden md:inline">Invite</span>
          </button>
        )}

        {/* ✅ THE LEAVE ICON (Professional placement) */}
        {userRole !== 'admin' && (
          <button 
            onClick={onLeave}
            title="Leave Workspace"
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-200"
          >
            <LogOut size={20} />
          </button>
        )}

        {/* Profile Avatar */}
        <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-indigo-600 border border-white dark:border-zinc-800 flex items-center justify-center text-[10px] font-black text-white hover:ring-4 hover:ring-indigo-500/20 transition-all">
          {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
        </button>
      </div>
    </nav>
  );
};

export default BoardNavbar;