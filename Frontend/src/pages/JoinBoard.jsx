import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import axios from '../utils/axios';
import { Loader2, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const JoinBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ FIX: Check sessionStorage first for tab-isolation, fallback to localStorage
  const user = JSON.parse(sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo'));

  const handleJoin = async () => {
    const searchParams = new URLSearchParams(location.search);
    const queryString = location.search; 

    if (!user) {
        toast.info("Please login or create an account to join.");
        // ✅ Add a flag to tell the login page to use sessionStorage for this tab
        navigate(`/login?redirect=/join/${id}${queryString}&session_isolate=true`);
        return; 
    }

    setLoading(true);
    try {
      const role = searchParams.get('role') || 'viewer';

      await axios.put(`/boards/${id}/join`, { role });
      
      toast.success("Joined board successfully!");
      navigate(`/board/${id}`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
          // ✅ Clear both on unauthorized
          localStorage.removeItem('userInfo');
          sessionStorage.removeItem('userInfo');
          navigate(`/login?redirect=/join/${id}${queryString}`);
          return;
      }
      setError("Failed to join. The link might be invalid or you are already a member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 font-sans text-zinc-900 dark:text-white">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 text-center animate-in fade-in zoom-in duration-300">
        
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
            {user ? <UserPlus size={32} /> : <LogIn size={32} />}
        </div>

        <h1 className="text-2xl font-bold mb-2">Join Workspace</h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            {user 
              ? `Join as ${user.name}?` 
              : "You've been invited to collaborate. Please log in to join."}
        </p>

        {error ? (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg mb-6 text-sm font-medium border border-red-200 dark:border-red-500/20">
                {error}
            </div>
        ) : (
            <div className="space-y-3">
                <button 
                    onClick={handleJoin}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        user ? 'Accept Invitation' : 'Log in to Accept'
                    )}
                </button>
                
                <button 
                    onClick={() => navigate(user ? '/dashboard' : '/')}
                    className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium py-3 rounded-xl transition-all"
                >
                    Cancel
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default JoinBoard;