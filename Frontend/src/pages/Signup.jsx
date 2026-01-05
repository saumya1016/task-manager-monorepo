import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, UserPlus } from 'lucide-react';
import axios from '../utils/axios';
import { toast } from 'sonner';

// --- FIREBASE IMPORTS ---
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invitedEmail = params.get('email');
    if (invitedEmail) setEmail(invitedEmail);
  }, [location]);

  // Handle Google Popup Login
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

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/project');
      toast.success(`Welcome ${fbUser.displayName}!`);
    } catch (err) {
      console.error(err);
      setError('Google authentication failed');
    }
  };

  // Standard Email Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/register', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/project');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-white font-sans relative overflow-x-hidden flex flex-col justify-center sm:py-12">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[80px] md:blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-4 sm:p-0">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-6 transition-colors group px-2 py-1">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
        </Link>

        <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-4">
                 <UserPlus size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
              <p className="text-sm text-zinc-400 mt-2">Join your team and start building.</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all mb-6 active:scale-[0.98]"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Sign up with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-zinc-900/80 text-zinc-500 backdrop-blur-xl">Or continue with email</span></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-medium animate-in slide-in-from-top-2">
                    {error}
                  </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-base sm:text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600 appearance-none"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">Email address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-base sm:text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600 appearance-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">Password</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-base sm:text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all pr-10 placeholder:text-zinc-600 appearance-none"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[32px] p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 active:scale-[0.98] touch-manipulation shadow-lg shadow-emerald-500/20"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? 'Creating account...' : 'Sign Up with Email'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-zinc-500">
              Already have an account? <Link to="/login" className="text-white font-medium hover:underline decoration-zinc-500 underline-offset-4 p-2">Log in</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;