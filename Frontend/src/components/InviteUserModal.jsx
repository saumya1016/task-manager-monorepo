import React, { useState } from 'react';
import { X, Copy, Check, Link } from 'lucide-react';
import { toast } from 'sonner';

const InviteUserModal = ({ isOpen, onClose, boardId }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate the join link dynamically based on the current domain and board ID
  // Example output: https://your-app.vercel.app/join/65a123...
  const joinLink = `${window.location.origin}/join/${boardId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      // Reset the "Copied" state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };

  return (
    // Backdrop with blur effect and animation
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 shadow-2xl relative">
        
        {/* Close Button (Top Right) */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
            <X size={20} />
        </button>
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Link size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Invite to Board</h2>
        </div>
        
        {/* Description */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Share this link with your team. Anyone with the link can join this board instantly.
        </p>
        
        {/* Copy Link Section */}
        <div className="flex gap-2">
            {/* Read-only Input showing the link */}
            <input 
                readOnly 
                value={joinLink} 
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 outline-none font-mono select-all"
            />
            
            {/* Copy Button with feedback state */}
            <button 
                onClick={handleCopy}
                disabled={copied}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 min-w-[110px] justify-center text-white
                    ${copied 
                        ? 'bg-green-600' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20'
                    }`}
            >
                {copied ? <Check size={16} className="animate-in zoom-in duration-200" /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;