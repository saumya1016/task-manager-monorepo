import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { Eye, EyeOff, Loader2, ArrowLeft, Layout, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from '../utils/axios';
import { toast } from 'sonner';

// --- FIREBASE IMPORTS ---
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //Reset Password States
  const [forgotMode, setForgotMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false); 
  const [resetStep, setResetStep] = useState(1); 
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') || '/dashboard';
  const shouldIsolate = params.get('session_isolate') === 'true';

  // Timer Logic
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const saveUserSession = (userData) => {
    const userString = JSON.stringify(userData);
    if (shouldIsolate) {
      sessionStorage.setItem('userInfo', userString);
    } else {
      localStorage.setItem('userInfo', userString);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email });
      setForgotMode(true);
      setResetStep(2);
      setResendTimer(60); 
      toast.success("Security code sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFinal = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter a valid 6-digit code.");
    
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', { email, otp, newPassword });
      toast.success("Password reset successful!", { description: "You can now sign in with your new credentials." });
      setForgotMode(false);
      setResetStep(1);
      setPassword('');
      setResendTimer(0);
      setError(''); // Clear any previous login errors
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Code may be expired.");
    } finally {
      setLoading(false);
    }
  };

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
      saveUserSession(data);
      navigate(redirectPath);
      toast.success(`Welcome back, ${fbUser.displayName}!`);
    } catch (err) {
      setError('Google login failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', { email, password });
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
        {!forgotMode && (
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
          </Link>
        )}

        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl shadow-2xl">
            
            <div className="mb-8 text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 transition-colors ${forgotMode ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20'}`}>
                 {forgotMode ? <ShieldCheck size={24} className="text-white" /> : <Layout size={24} className="text-white" />}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {forgotMode ? "Reset Security" : shouldIsolate ? "Tab-Isolated Login" : "Welcome back"}
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 tracking-widest">
                {forgotMode ? `Verification code sent to ${email.split('@')[0]}...` : shouldIsolate ? "Joining workspace in this tab only" : "TaskFlow Collaboration Hub"}
              </p>
            </div>

            {forgotMode && resetStep === 2 ? (
              <form onSubmit={handleResetFinal} className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                <div>
                  <div className="flex justify-between items-end mb-1.5 ml-1">
                    <label className="block text-xs font-medium text-zinc-300 uppercase tracking-tighter">Verification Code</label>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleForgotPassword}
                      className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="000000" 
                    maxLength="6"
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-emerald-500/50 transition-all text-white outline-none" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1 uppercase tracking-tighter">New Secure Password</label>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all pr-10 text-white" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[32px] p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18}/> Update Password</>}
                </button>

                <button 
                  type="button"
                  onClick={() => { setForgotMode(false); setResetStep(1); setError(''); }}
                  className="w-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors py-2"
                >
                  Cancel and Return
                </button>
              </form>
            ) : (
              <>
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all mb-6 active:scale-[0.98]"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-zinc-950 text-zinc-500 tracking-widest">Or email</span></div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center">{error}</div>}
                  
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1 uppercase tracking-tighter">Email address</label>
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
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1 uppercase tracking-tighter">Password</label>
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
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors px-1"
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
              </>
            )}

            <p className="mt-8 text-center text-xs text-zinc-500">
              Don't have an account? <Link to={`/signup?redirect=${encodeURIComponent(redirectPath)}&session_isolate=${shouldIsolate}`} className="text-white font-medium hover:underline decoration-zinc-500 underline-offset-4">Create one</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;