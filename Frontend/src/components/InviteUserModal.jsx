import React, { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const InviteUserModal = ({ isOpen, onClose, boardId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Create the link your friend will click
    const inviteLink = `${window.location.origin}/join/${boardId}`;

   // ✅ USE ENV VARIABLES HERE
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const templateParams = {
      to_email: email,        // Matches {{to_email}} in your template
      message: inviteLink,    // Matches {{message}} in your template
    };

    try {
      // 2. Send the email directly from the browser
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      toast.success(`Invite sent to ${email}!`);
      
      // 3. Clear form and close modal
      setTimeout(() => {
        onClose();
        setEmail('');
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send. Please check your Service ID and Keys.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
            <X size={20} />
        </button>
        
        {/* Header */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
            <Mail className="text-indigo-500" /> Invite by Email
        </h2>
        
        <form onSubmit={handleSendInvite}>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Enter your friend's email address. They will receive a link to join this board instantly.
            </p>
            
            <input 
                type="email" 
                required
                placeholder="friend@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 outline-none mb-4 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            
            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Invite'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;