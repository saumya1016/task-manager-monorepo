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
  
  const user = JSON.parse(sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo'));

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");
    
    setIsSending(true);
    try {
      await emailjs.send(
        serviceId, 
        templateId, 
        {
          // ✅ FIX: Manually provide your email here.
          // Your dashboard expects {{to_email}}, so you must send this key.
          to_email: 'your-personal-email@gmail.com', 
          
          from_name: user?.name || 'Anonymous User',
          from_email: user?.email || 'No Email',
          rating: rating,
          message: reviewText || 'No comments provided'
        }, 
        publicKey
      );
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#fbbf24']
      });

      // ✅ Show success state
      setIsSubmitted(true);
      toast.success("Feedback delivered!");

      // ✅ RESET States immediately so the form is empty when it reappears
      setRating(0);
      setReviewText('');
      setHoveredRating(0);

      // ✅ Hide the success overlay after 3 seconds to "refresh" the form
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send. Please check your EmailJS config.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-12 px-6 transition-colors duration-500 font-sans">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Support Hub</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">Feedback</h1>
          </div>
          
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all shadow-sm active:scale-95 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Boards
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-8 md:p-16 relative min-h-[550px] flex flex-col justify-center">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[120px] pointer-events-none" />

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in-95 duration-500 relative z-20">
               <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 rotate-12">
                 <CheckCircle2 size={48} strokeWidth={2.5} />
               </div>
               <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white mb-3">Feedback Logged!</h2>
               <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mb-10 text-lg">
                 Thank you. Your input helps evolve this workspace.
               </p>
               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                 <Loader2 size={12} className="animate-spin" />
                 Revealing form in 3 seconds
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">Experience <Sparkles size={18} className="text-amber-400" /></h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1">How would you rate the TaskFlow workspace?</p>
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
                        className={`${(hoveredRating || rating) >= star ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'text-zinc-200 dark:text-zinc-800'} transition-all duration-200`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-1">Your review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us what you love or what needs to change..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 text-base font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all h-44 resize-none dark:text-white"
                />
              </div>

              <button
                disabled={isSending || rating === 0}
                className="group w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
              >
                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Send Feedback
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;