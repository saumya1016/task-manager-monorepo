import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Zap, Shield, Layout } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-zinc-950 font-sans overflow-x-hidden">
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Top Glow */}
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[-10%] right-[20%] w-[50%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* --- Navbar --- */}
      <nav className="relative z-50 w-full px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layout size={16} className="text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">TaskFlow</span>
        </div>

        <div className="flex gap-6 items-center">
          <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Log in</Link>
          <Link to="/signup" className="group bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-all flex items-center gap-1">
            Get Started 
            <ArrowRight size={14} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
          </Link>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center pt-24 pb-32 px-4 max-w-5xl mx-auto">
        
        {/* Announcement Badge */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm text-xs font-medium text-zinc-300 hover:border-zinc-700 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 is now live
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Workflow tailored <br /> for <span className="text-white">creators.</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          TaskFlow removes the friction from project management. 
          Experience a tool designed for speed, clarity, and focus.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Link to="/signup" className="bg-white text-black h-12 px-8 rounded-full font-semibold flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95">
            Start for free
          </Link>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
            <Link to="/login" className="relative h-12 px-8 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-300 font-medium flex items-center justify-center hover:text-white transition-all">
               Live Demo
            </Link>
          </div>
        </div>

        {/* --- Feature Grid (Bento Style) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-24 w-full text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-4 group-hover:text-white group-hover:scale-110 transition-all">
                    <Zap size={20} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">Lightning Fast</h3>
                <p className="text-sm text-zinc-500">Built for speed. No page loads, no waiting. Updates happen instantly.</p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-4 group-hover:text-white group-hover:scale-110 transition-all">
                    <Layout size={20} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">Focus Mode</h3>
                <p className="text-sm text-zinc-500">A clean interface that gets out of your way so you can just build.</p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-4 group-hover:text-white group-hover:scale-110 transition-all">
                    <Shield size={20} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">Secure by Default</h3>
                <p className="text-sm text-zinc-500">Enterprise-grade security with encrypted data and secure authentication.</p>
            </div>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm">
            <p>© 2024 TaskFlow Inc.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-zinc-300">Privacy</a>
                <a href="#" className="hover:text-zinc-300">Terms</a>
                <a href="#" className="hover:text-zinc-300">Twitter</a>
            </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;