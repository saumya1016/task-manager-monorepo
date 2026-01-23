import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, CheckCircle, Clock, 
  Camera, User, Lock, LogOut, Activity, Settings, Zap, Mail, ChevronRight
} from 'lucide-react';
import axios from '../utils/axios'; 

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, efficiency: '0%' });
  const user = JSON.parse(localStorage.getItem('userInfo'));

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

  if (!user) return null;

  // Balanced Circular Progress (Radius 32 is the "sweet spot")
  const efficiencyValue = parseInt(stats.efficiency) || 0;
  const radius = 32; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (efficiencyValue / 100) * circumference;

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans text-zinc-900 selection:bg-indigo-100">
      
      {/* --- SIDEBAR (COMFORTABLE SCALE) --- */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-6 z-20">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="group flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors mb-10"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back
        </button>

        <div className="flex flex-col items-center mb-10 px-2">
          <div className="relative mb-4 group/avatar">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 p-0.5 shadow-xl shadow-indigo-100">
              <div className="w-full h-full rounded-[1.1rem] bg-white flex items-center justify-center text-2xl font-black text-indigo-600">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <button className="absolute -bottom-1 -right-1 p-2 bg-white text-zinc-500 rounded-lg border border-gray-200 shadow-sm hover:text-indigo-600 transition-all opacity-0 group-hover/avatar:opacity-100 transform translate-y-1 group-hover/avatar:translate-y-0">
              <Camera size={14}/>
            </button>
          </div>
          <h2 className="text-base font-bold tracking-tight text-zinc-800">{user.name}</h2>
          <span className="mt-2 px-3 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold uppercase tracking-tighter text-indigo-600 border border-indigo-100 flex items-center gap-1">
            <Shield size={10} /> Owner
          </span>
        </div>

        <nav className="space-y-1.5 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity size={18}/> },
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
          onClick={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} 
          className="mt-auto flex items-center justify-center gap-2.5 p-3.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-10 overflow-y-auto bg-white relative">
        <div className="max-w-5xl mx-auto relative z-10">
          
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* 1. Hero Card */}
              <div className="md:col-span-3 bg-indigo-600 p-10 rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-indigo-100">
                <Zap className="absolute -right-8 -top-8 w-52 h-52 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold tracking-tight mb-2 text-white italic">Welcome, {user.name.split(' ')[0]}.</h1>
                  <p className="text-indigo-100 text-base font-medium leading-relaxed max-w-sm">
                    Your workspace is active and optimized. You've completed <span className="text-white font-black underline decoration-indigo-300 decoration-2 underline-offset-4">{stats.completed} tasks</span> so far.
                  </p>
                </div>
              </div>

              {/* 2. Efficiency Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center shadow-md">
                <div className="relative w-24 h-24 mb-4 text-indigo-600">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                    <circle 
                      cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      className="transition-all duration-1000 ease-out" 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold tracking-tighter text-zinc-800">
                    {stats.efficiency}
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Personal Score</span>
              </div>

              {/* 3. Status Grid */}
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-emerald-100 transition-all hover:-translate-y-1">
                <CheckCircle size={24} className="text-emerald-600" />
                <div className="mt-6">
                  <p className="text-4xl font-black text-emerald-700 tracking-tighter">{stats.completed}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/60">Resolved</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-8 rounded-[2rem] flex flex-col justify-between group hover:border-indigo-100 transition-all shadow-md hover:-translate-y-1">
                <Clock size={24} className="text-orange-500" />
                <div className="mt-6">
                  <p className="text-4xl font-black text-zinc-800 tracking-tighter">{stats.inProgress}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">In Pipeline</p>
                </div>
              </div>

              {/* 4. Activity Logs */}
              <div className="md:col-span-2 bg-gray-50 border border-gray-100 p-8 rounded-[2rem]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Live Pulse</span>
                  <Activity size={14} className="text-indigo-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                      <p className="text-sm font-bold text-zinc-700">Database synchronization verified</p>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Now</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* --- SETTINGS TAB --- */
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
              <header>
                <h2 className="text-3xl font-black tracking-tight text-zinc-800 italic">Settings</h2>
                <p className="text-zinc-500 text-base font-medium">Manage your workspace identity and security keys.</p>
              </header>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-lg shadow-gray-100 space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Identity Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-400 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user.name} 
                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white text-sm font-bold transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-zinc-400 ml-1">Email Key</label>
                      <div className="w-full bg-gray-100 border border-gray-200 p-4 rounded-2xl text-zinc-500 text-sm font-bold flex items-center gap-3 cursor-not-allowed">
                        <Mail size={16}/> {user.email}
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100">
                    Update Workspace Profile
                  </button>
                </div>

                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 border-dashed">
                  <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all group shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-gray-50 rounded-xl text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        <Lock size={20}/>
                      </div>
                      <div className="text-left">
                        <p className="text-base font-bold text-zinc-800">Rotation: Access Key</p>
                        <p className="text-xs text-zinc-500 font-medium tracking-tight">Protect your account access</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;