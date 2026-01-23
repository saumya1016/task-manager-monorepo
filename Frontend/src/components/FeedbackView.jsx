import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import confetti from 'canvas-confetti';

const FeedbackView = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('userInfo'));

  // --- AUTOMATIC REFRESH LOGIC ---
  useEffect(() => {
    let timer;
    if (isSubmitted) {
      // Refresh the form after 5 seconds
      timer = setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setReviewText('');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");
    
    setIsSending(true);
    try {
      await emailjs.send(
        'YOUR_SERVICE_ID', 
        'YOUR_TEMPLATE_ID', 
        {
          from_name: user?.name || 'Anonymous User',
          from_email: user?.email || 'No Email',
          rating: rating,
          message: reviewText || 'No comments provided'
        }, 
        'YOUR_PUBLIC_KEY'
      );
      
      // Trigger Celebration
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#fbbf24']
      });

      setIsSubmitted(true);
      toast.success("Feedback delivered!");
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-12 px-6 transition-colors duration-500">
      <div className="w-full max-w-4xl">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Feedback Hub</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
              Improvement
            </h1>
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all shadow-sm active:scale-95 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Boards
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-indigo-500/5 overflow-hidden p-8 md:p-16 relative min-h-[550px] flex flex-col justify-center">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[120px] pointer-events-none" />

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              {/* Star Rating Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    How is your experience? <Sparkles size={18} className="text-amber-400" />
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Tap a star to give your rating.</p>
                </div>

                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-all transform hover:scale-125 active:scale-90 outline-none"
                    >
                      <Star 
                        size={52} 
                        fill={(hoveredRating || rating) >= star ? "currentColor" : "none"} 
                        strokeWidth={1.5}
                        className={`
                          ${(hoveredRating || rating) >= star 
                            ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' 
                            : 'text-zinc-200 dark:text-zinc-800'
                          } transition-all duration-200
                        `}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div className="inline-block px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 animate-in zoom-in-95">
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
                      {rating === 5 ? "Loved it! 😍" : rating === 4 ? "Great job! 😊" : rating === 3 ? "It's good 👍" : "Needs work 🛠️"}
                    </p>
                  </div>
                )}
              </div>

              {/* Text Area Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Your suggestions</label>
                  <span className="text-[10px] font-bold text-zinc-400 italic">Optional</span>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts on how to make TaskFlow better..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 text-base font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all h-44 resize-none dark:text-white placeholder:text-zinc-400 leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                disabled={isSending}
                className="group w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-500/20 active:translate-y-1 hover:shadow-indigo-500/40"
              >
                {isSending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
                Confirm Submission
              </button>
            </form>
          ) : (
            /* --- SUCCESS STATE (REFRESHES AFTER 5S) --- */
            <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 rotate-12">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white mb-3">Feedback Logged!</h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mb-10 text-lg">
                Thank you, <span className="text-indigo-500 font-bold">{user?.name?.split(' ')[0]}</span>. Your input helps evolve this workspace.
              </p>
              
              <div className="flex flex-col items-center gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Loader2 size={12} className="animate-spin" />
                    Resetting form in 5 seconds
                 </div>
                 <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-black/20"
                >
                  Go to Dashboard Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;