import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Shield, CheckCircle, Clock, 
  Camera, User, Lock, LogOut, Activity, Settings 
} from 'lucide-react';
import axios from '../utils/axios'; 

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for real stats
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    efficiency: '0%'
  });
  
  // Get user data
  const user = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    // --- FETCH REAL STATS FROM BACKEND ---
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/tasks/stats');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans text-zinc-900 dark:text-white transition-colors duration-300 flex flex-col md:flex-row">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-full md:w-80 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col p-6 sticky top-0 h-auto md:h-screen z-20">
        
        <button 
            onClick={() => navigate('/project')} 
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-8"
        >
            <ArrowLeft size={16} /> Back to Board
        </button>

        <div className="flex flex-col items-center text-center mb-8">
            <div className="relative group mb-4">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-1">
                    <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-4xl font-bold text-zinc-700 dark:text-zinc-200 overflow-hidden">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-zinc-900 text-white rounded-full border-4 border-white dark:border-zinc-900 hover:bg-indigo-600 transition-colors">
                    <Camera size={14} />
                </button>
            </div>
            
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{user.email}</p>
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                <Shield size={10} /> {user.role || 'Member'}
            </span>
        </div>

        <nav className="flex-1 space-y-1">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'overview' 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
            >
                <Activity size={18} /> Overview
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'settings' 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
            >
                <Settings size={18} /> Settings
            </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-800">
            <button 
                onClick={() => {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-bold transition-all"
            >
                <LogOut size={16} /> Sign Out
            </button>
        </div>
      </aside>

      {/* --- RIGHT CONTENT AREA --- */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]} 👋</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Here's what's happening with your projects today.</p>
                </header>

                {/* REAL STATS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{stats.completed}</p>
                            <p className="text-sm text-zinc-500 font-medium">Tasks Completed</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-orange-100 dark:bg-orange-500/10 rounded-full text-orange-600 dark:text-orange-400">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{stats.inProgress}</p>
                            <p className="text-sm text-zinc-500 font-medium">In Progress</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400">
                            <Shield size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{stats.efficiency}</p>
                            <p className="text-sm text-zinc-500 font-medium">Efficiency Score</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex gap-4 items-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">You completed <strong>{stats.completed} tasks</strong> total</p>
                        <span className="ml-auto text-xs text-zinc-400">Lifetime</span>
                    </div>
                    <div className="p-4 flex gap-4 items-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">You have <strong>{stats.inProgress} active tasks</strong> remaining</p>
                        <span className="ml-auto text-xs text-zinc-400">Current</span>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your account preferences and security.</p>
                </header>

                <div className="space-y-6">
                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={20} /> Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                                <input type="text" defaultValue={user.name} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email Address</label>
                                <input type="email" defaultValue={user.email} disabled className="w-full bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">Save Changes</button>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Lock size={20} /> Security</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Current Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">New Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="bg-transparent border border-gray-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">Update Password</button>
                        </div>
                    </section>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default ProfilePage;