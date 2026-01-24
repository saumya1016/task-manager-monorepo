import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { Eye, EyeOff, Loader2, ArrowLeft, Layout } from 'lucide-react';
import axios from '../utils/axios';
import { toast } from 'sonner';

// --- FIREBASE IMPORTS ---
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || '/dashboard';
  // ✅ Check if this login should be isolated to this tab only
  const shouldIsolate = params.get('session_isolate') === 'true';

  // --- HELPER: SAVE USER SESSION ---
  const saveUserSession = (userData) => {
    const userString = JSON.stringify(userData);
    
    if (shouldIsolate) {
      // ✅ Isolated Tab: Only save to sessionStorage so it doesn't overwrite other tabs
      sessionStorage.setItem('userInfo', userString);
    } else {
      // ✅ Normal Login: Save to localStorage for persistence
      localStorage.setItem('userInfo', userString);
    }
  };

  // --- HANDLE FORGOT PASSWORD ---
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address in the field above first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (err) {
      toast.error(err.message || "Failed to send reset email.");
    }
  };

  // --- HANDLE GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const { data } = await axios.post('/auth/google-sync', {
        name: fbUser.displayName,
        email: fbUser.email,
        avatar: fbUser.photoURL 
      });

      // ✅ Use isolation-aware save function
      saveUserSession(data);
      
      navigate(redirectPath);
      toast.success(`Welcome back, ${fbUser.displayName}!`);
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError('Google login failed. Please try again.');
    }
  };

  // --- HANDLE EMAIL LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      
      // ✅ Use isolation-aware save function
      saveUserSession(data);
      
      navigate(redirectPath);
      toast.success("Logged in successfully!");
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
        </Link>

        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl shadow-2xl">
            <div className="mb-8 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-4">
                 <Layout size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {shouldIsolate ? "Tab-Isolated Login" : "Welcome back"}
              </h1>
              {shouldIsolate && (
                <p className="text-[10px] text-indigo-400 font-bold uppercase mt-2">
                  Joining workspace in this tab only
                </p>
              )}
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all mb-6 active:scale-[0.98]"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-zinc-900 text-zinc-500">Or email</span></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center">{error}</div>}
              
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">Email address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white" 
                  value={email} 
                  onChange={(e) => { setEmail(e.target.value); setError(''); }} 
                  required 
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">Password</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all pr-10 text-white" 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); setError(''); }} 
                  required 
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[32px] p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <div className="flex justify-end mt-1.5">
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors px-1"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-zinc-500">
              Don't have an account? <Link to={`/signup?redirect=${encodeURIComponent(redirectPath)}&session_isolate=${shouldIsolate}`} className="text-white font-medium hover:underline decoration-zinc-500 underline-offset-4">Create one</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;