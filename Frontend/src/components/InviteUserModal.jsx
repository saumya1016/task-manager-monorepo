import React, { useState } from 'react';
import api from '../utils/axios'; // Ensure this points to your configured axios

const InviteUserModal = ({ isOpen, onClose, boardId, onInviteSuccess }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      // Step 1: Check if user exists or send email
      const res = await api.post('/auth/invite', { email });

      if (res.data.isExistingUser) {
        // Step 2: If they exist, add them to the board immediately
        const userId = res.data.user._id;
        await api.post(`/boards/${boardId}/add-member`, { userId });
        setMessage(`User ${res.data.user.name} added to board!`);
      } else {
        setMessage('Invitation email sent successfully!');
      }

      setStatus('success');
      onInviteSuccess(); // Refresh the board data
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail('');
        setMessage('');
      }, 2000);
      
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Invite Member</h2>
        
        <form onSubmit={handleInvite}>
          <input
            type="email"
            placeholder="Enter friend's email"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {message && (
            <div className={`p-2 mb-4 text-sm rounded ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {status === 'loading' ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;