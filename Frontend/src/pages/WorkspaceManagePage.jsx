import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, UserMinus, Mail, 
  Calendar, Settings, Users, Zap, Share2, XCircle, Copy, Link as LinkIcon 
} from 'lucide-react';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const WorkspaceManagePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const user = JSON.parse(sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await axios.get(`/boards/${id}`);
                setBoard(data);
            } catch (err) {
                toast.error("Workspace not found");
                navigate('/profile');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    useEffect(() => {
        if (board && user) {
            socket.emit('join-presence', { boardId: id, userId: user.id || user._id });
            socket.on('online-users-update', (users) => {
                setOnlineUsers(users);
            });
        }
        return () => {
            socket.off('online-users-update');
        };
    }, [board, id, user]);

    const handleRevoke = async (memberId, memberName) => {
        try {
            await axios.delete(`/boards/${id}/members/${memberId}`);
            setBoard(prev => ({
                ...prev,
                members: prev.members.filter(m => m.user._id !== memberId)
            }));
            toast.success(`Access Revoked`, { description: `${memberName} has been removed.` });
        } catch (err) { 
            toast.error("Revoke failed"); 
        } finally {
            setRevokingId(null);
        }
    };

    const copyInviteLink = () => {
        const link = `${window.location.origin}/join/${id}`;
        navigator.clipboard.writeText(link);
        toast.success("Invite Link Copied");
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <Zap className="animate-bounce text-indigo-600 mb-4" size={32} />
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 font-sans">Syncing Permissions</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 pb-20">
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-all group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={copyInviteLink} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"><Share2 size={18}/></button>
                        <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"><Settings size={18}/></button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto mt-12 px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-lg shadow-indigo-200">Management</span>
                            <span className="text-zinc-300 text-[10px] font-bold">/</span>
                            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Team Access</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">{board.title}</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Collaborators</p>
                            <p className="text-3xl font-black italic text-center">{board.members.length + 1}</p>
                        </div>
                        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Authority</p>
                            <p className="text-xl font-black italic text-indigo-600 text-center uppercase">{board.owner._id === (user.id || user._id) ? 'Admin' : 'Member'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-zinc-200/20">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contributor</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Access</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    <tr className="group transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                {/* ✅ ADMIN AVATAR WITH S3 IMG + PRESENCE */}
                                                <div className="relative">
                                                  <div className={`w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-200 uppercase transition-all duration-500 overflow-hidden ${onlineUsers.includes(board.owner._id) ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                                                      {board.owner.profilePicture ? (
                                                          <img src={board.owner.profilePicture} className="w-full h-full object-cover" alt="Admin" />
                                                      ) : (
                                                          board.owner.name?.charAt(0)
                                                      )}
                                                  </div>
                                                  {onlineUsers.includes(board.owner._id) && (
                                                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                                      </div>
                                                  )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-zinc-800">{board.owner.name}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold">{board.owner.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit border border-indigo-100">
                                                <ShieldCheck size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Admin</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-[9px] text-zinc-300 uppercase tracking-widest italic">Creator</td>
                                    </tr>

                                    {board.members.map((m) => (
                                        <tr key={m.user._id} className="group hover:bg-zinc-50/30 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {/* ✅ MEMBER AVATAR WITH S3 IMG + PRESENCE */}
                                                    <div className="relative">
                                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black uppercase shadow-inner border transition-all duration-500 overflow-hidden ${onlineUsers.includes(m.user._id) ? 'bg-white text-indigo-600 border-emerald-500 scale-105 shadow-emerald-100' : 'bg-zinc-100 text-zinc-400 border-zinc-200/50'}`}>
                                                          {m.user.profilePicture ? (
                                                              <img src={m.user.profilePicture} className="w-full h-full object-cover" alt="Member" />
                                                          ) : (
                                                              m.user.name?.charAt(0) || '?'
                                                          )}
                                                      </div>
                                                      {onlineUsers.includes(m.user._id) && (
                                                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                                          </div>
                                                      )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-sm text-zinc-800 truncate">{m.user.name} {(m.user._id === user.id || m.user._id === user._id) && <span className="text-indigo-600 text-[10px] ml-1">(You)</span>}</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold truncate">{m.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[8px] font-black uppercase bg-zinc-100 text-zinc-400 px-3 py-1 rounded-full tracking-widest border border-zinc-200">Collaborator</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {(board.owner._id === (user.id || user._id)) && m.user._id !== (user.id || user._id) && (
                                                    <div className="flex justify-end">
                                                        {revokingId === m.user._id ? (
                                                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                                                                <button onClick={() => handleRevoke(m.user._id, m.user.name)} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">Confirm</button>
                                                                <button onClick={() => setRevokingId(null)} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"><XCircle size={18} /></button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setRevokingId(m.user._id)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-zinc-50 text-zinc-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 scale-95 hover:scale-100 border border-zinc-200/50 shadow-sm"
                                                            >
                                                                <UserMinus size={16} strokeWidth={2.5} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Revoke Access</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gradient-to-br from-white to-zinc-50 border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tight text-zinc-800">Growth Protocol</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Generate access links for new collaborators</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                    <LinkIcon size={20} />
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-4 items-center bg-white border border-zinc-200 p-3 rounded-[2rem] shadow-inner group/invite">
                                <div className="flex-1 px-4 py-2 text-[11px] font-black text-zinc-400 tracking-widest truncate italic">
                                    {window.location.origin}/join/{id}
                                </div>
                                <button 
                                    onClick={copyInviteLink}
                                    className="w-full md:w-auto px-8 py-4 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/10"
                                >
                                    <Copy size={14} /> Copy Invite Link
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm hover:border-indigo-100 transition-colors">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Security Context</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                    <div>
                                        <p className="text-xs font-black text-zinc-800 italic">Auth Verification</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Cloud Hub Active</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 opacity-40">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500" />
                                    <div>
                                        <p className="text-xs font-black text-zinc-800 italic">Access Refreshed</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceManagePage;