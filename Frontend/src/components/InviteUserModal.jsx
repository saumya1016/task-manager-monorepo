import React, { useState } from 'react';
import { X, Mail, Loader2, Shield, User, Eye } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const InviteUserModal = ({ isOpen, onClose, boardId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer'); // Default role
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. ✅ Create Invite Link with Role
    // Example: https://myapp.com/join/12345?role=member
    const inviteLink = `${window.location.origin}/join/${boardId}?role=${role}`;

    // 2. Load Env Variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // 3. Prepare Email Data
    const templateParams = {
      to_email: email,
      role: role.toUpperCase(), // Display role in email (e.g., "ADMIN")
      message: inviteLink,
    };

    try {
      // 4. Send Email
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      toast.success(`Invite sent to ${email} as ${role}!`);
      
      // 5. Reset and Close
      setTimeout(() => {
        onClose();
        setEmail('');
        setRole('viewer'); // Reset to default
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send invite. Check your EmailJS config.");
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
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-zinc-900 dark:text-white">
            <Mail className="text-indigo-500" /> Invite Collaborator
        </h2>
        <p className="text-xs text-zinc-500 mb-6">Send an invite link via email.</p>
        
        <form onSubmit={handleSendInvite} className="space-y-5">
            
            {/* Email Input */}
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email Address</label>
                <input 
                    type="email" 
                    required
                    placeholder="friend@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
            </div>

            {/* ✅ Role Selection Grid */}
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Select Permission Role</label>
                <div className="grid grid-cols-3 gap-2">
                    
                    {/* Viewer Button */}
                    <button
                        type="button"
                        onClick={() => setRole('viewer')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            role === 'viewer' 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' 
                            : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-zinc-500'
                        }`}
                    >
                        <Eye size={20} className="mb-1" />
                        <span className="text-xs font-bold">Viewer</span>
                    </button>

                    {/* Member Button */}
                    <button
                        type="button"
                        onClick={() => setRole('member')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            role === 'member' 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' 
                            : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-zinc-500'
                        }`}
                    >
                        <User size={20} className="mb-1" />
                        <span className="text-xs font-bold">Member</span>
                    </button>

                    {/* Admin Button */}
                    <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            role === 'admin' 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' 
                            : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-zinc-500'
                        }`}
                    >
                        <Shield size={20} className="mb-1" />
                        <span className="text-xs font-bold">Admin</span>
                    </button>
                </div>
                
                {/* Dynamic Helper Text based on selection */}
                <p className="text-[10px] text-zinc-400 mt-2 text-center h-4">
                    {role === 'viewer' && "Can only view tasks. Cannot create, edit, or move."}
                    {role === 'member' && "Can edit and move tasks, but CANNOT create new ones."}
                    {role === 'admin' && "Full access to create, edit, move, and delete tasks."}
                </p>
            </div>
            
            {/* Submit Button */}
            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Invite'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;