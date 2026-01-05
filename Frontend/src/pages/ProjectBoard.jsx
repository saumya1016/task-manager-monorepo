import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Search, UserPlus, X, Loader2, AlertTriangle, ChevronDown, Layout, Sun, Moon, Shield } from 'lucide-react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

// Import Components
import TaskCard from '../components/TaskCard';
import EditTaskModal from '../components/EditTaskModal';

// --- Helper for React 18 DnD ---
export const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

const ProjectBoard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Data State
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({
    'col-1': { id: 'col-1', title: 'Assigned', taskIds: [] },
    'col-2': { id: 'col-2', title: 'In Progress', taskIds: [] },
    'col-3': { id: 'col-3', title: 'Review', taskIds: [] },
    'col-4': { id: 'col-4', title: 'Done', taskIds: [] },
  });
  const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4'];
  const [searchQuery, setSearchQuery] = useState('');

  // UI State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  
  // Inputs
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member'); 
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDeadline, setNewDeadline] = useState('');

  // Theme Toggle Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }
    setCurrentUser(userInfo);
    fetchTasks();
  }, [navigate]);

  // --- ROLE CHECK ---
  const isViewer = currentUser?.role === 'viewer'; 
  const isAdmin = currentUser?.role === 'admin';

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/tasks');
      const newTasks = {};
      const newColumns = { 
        'col-1': { id: 'col-1', title: 'Assigned', taskIds: [] }, 
        'col-2': { id: 'col-2', title: 'In Progress', taskIds: [] }, 
        'col-3': { id: 'col-3', title: 'Review', taskIds: [] }, 
        'col-4': { id: 'col-4', title: 'Done', taskIds: [] } 
      };
      
      data.forEach(task => { 
        newTasks[task._id] = { id: task._id, ...task }; 
        if (newColumns[task.status]) newColumns[task.status].taskIds.push(task._id); 
      });
      
      setTasks(newTasks); 
      setColumns(newColumns);
    } catch (error) { toast.error("Failed to load tasks"); } finally { setLoading(false); }
  };

  const onDragEnd = async (result) => {
    if (searchQuery || isViewer) return; 
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...start, taskIds: newTaskIds };
      setColumns({ ...columns, [newColumn.id]: newColumn });
    } else {
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...start, taskIds: startTaskIds };
      
      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finish, taskIds: finishTaskIds };
      
      setColumns({ ...columns, [newStart.id]: newStart, [newFinish.id]: newFinish });
      
      try { 
        await axios.put(`/tasks/${draggableId}`, { status: destination.droppableId }); 
      } catch (error) { 
        toast.error("Failed to save move");
      }
    }
  };

  const handleCreateTask = async () => {
    if(!newTaskContent.trim()) return;
    try {
      const { data } = await axios.post('/tasks', { 
        content: newTaskContent, 
        status: 'col-1', 
        tag: 'General', 
        priority: newPriority, 
        deadline: newDeadline 
      });
      const newTask = { id: data._id, ...data };
      const newCol = { ...columns['col-1'], taskIds: [...columns['col-1'].taskIds, data._id] };
      
      setTasks({ ...tasks, [data._id]: newTask });
      setColumns({ ...columns, 'col-1': newCol });
      
      setNewTaskContent(''); setNewPriority('Medium'); setNewDeadline(''); setIsCreating(false);
      toast.success("Task created");
    } catch (error) { toast.error("Failed to create task"); }
  };

  const confirmDeleteTask = async () => {
    if (!deleteData) return;
    try {
      await axios.delete(`/tasks/${deleteData.taskId}`);
      const newColTaskIds = columns[deleteData.columnId].taskIds.filter(id => id !== deleteData.taskId);
      const newColumns = { ...columns, [deleteData.columnId]: { ...columns[deleteData.columnId], taskIds: newColTaskIds } };
      const newTasks = { ...tasks };
      delete newTasks[deleteData.taskId];
      setColumns(newColumns); setTasks(newTasks);
      toast.success("Task deleted"); setDeleteData(null);
    } catch (error) { toast.error("Failed to delete task"); }
  };

  const handleUpdateTask = async (updatedData) => {
    try {
      const { data } = await axios.put(`/tasks/${updatedData.id}`, updatedData);
      setTasks({ ...tasks, [updatedData.id]: { ...tasks[updatedData.id], ...data } });
      setEditingTask(null);
      toast.success("Task updated");
    } catch (error) { toast.error("Failed to update task"); }
  };

  const handleInvite = async (e) => {
    e.preventDefault(); 
    setInviteLoading(true);
    try { 
      await axios.post('/auth/invite', { email: inviteEmail, role: inviteRole }); 
      toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`); 
      setInviteEmail(''); 
      setIsInviteOpen(false); 
    } catch (error) { 
      toast.error('Failed to send invite'); 
    } finally { 
      setInviteLoading(false); 
    }
  };

  if (loading) return <div className="h-screen bg-white dark:bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans overflow-hidden relative selection:bg-indigo-500/30 transition-colors duration-300">
      <Toaster position="bottom-right" theme={isDarkMode ? "dark" : "light"} richColors />
      
      {/* Background FX */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navbar */}
      <nav className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 sticky top-0 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-xl z-20 transition-colors duration-300">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Layout size={16} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg text-zinc-900 dark:text-white">TaskFlow</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-white transition-colors" size={16} />
            <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-full text-sm text-zinc-900 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-300 dark:focus:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all w-64 placeholder:text-zinc-500" 
            />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-white"><X size={12} /></button>}
          </div>

           <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>

           {!isViewer && (
             <button onClick={() => setIsInviteOpen(true)} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                <UserPlus size={18} /> <span className="hidden md:inline">Invite</span>
             </button>
           )}

           <button onClick={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">Logout</button>
           
           {/* --- UPDATED: Navigate to /profile when clicked --- */}
           <button 
             onClick={() => navigate('/profile')} 
             className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:ring-2 hover:ring-indigo-500 hover:scale-105 transition-all cursor-pointer"
           >
             {currentUser.name?.charAt(0).toUpperCase()}
           </button>
        </div>
      </nav>

      {/* Board Content */}
      <div className="flex-1 p-8 overflow-x-auto overflow-y-hidden relative z-10">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Project Board</h1>
           
           {!isViewer && (
             <div className="flex gap-2">
               {isCreating ? (
                  <div className="flex gap-2 items-center animate-in fade-in slide-in-from-right-4 duration-200 bg-white dark:bg-zinc-900/50 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <input autoFocus type="text" placeholder="Task name..." className="bg-transparent border-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:ring-0 w-48" value={newTaskContent} onChange={e => setNewTaskContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateTask()} />
                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-zinc-800 mx-1"></div>
                    <div className="relative">
                      <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="appearance-none bg-gray-100 dark:bg-zinc-800 border-none rounded text-xs text-zinc-700 dark:text-zinc-300 py-1 pl-2 pr-6 focus:ring-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                          <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>
                    <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="bg-gray-100 dark:bg-zinc-800 border-none rounded text-xs text-zinc-700 dark:text-zinc-300 py-1 px-2 focus:ring-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700" />
                    <button onClick={handleCreateTask} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-500 transition-colors">Add</button>
                    <button onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-1"><X size={16} /></button>
                  </div>
               ) : ( 
                  <button onClick={() => setIsCreating(true)} className="bg-indigo-600 text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 dark:hover:bg-zinc-200 flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 dark:shadow-white/5">
                      <Plus size={16} /> New Issue
                  </button> 
               )}
             </div>
           )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-[calc(100vh-12rem)] pb-4 min-w-max">
            {columnOrder.map((columnId) => {
              const column = columns[columnId];
              const visibleTasks = column.taskIds.map((taskId) => tasks[taskId]).filter(task => {
                if (!task) return false;
                return task.content.toLowerCase().includes(searchQuery.toLowerCase())
              });
              
              return (
                <div key={column.id} className="w-80 shrink-0 flex flex-col h-full bg-gray-100/50 dark:bg-zinc-900/30 rounded-xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <div className="flex justify-between items-center p-4 pb-2">
                    <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{column.title}</h2>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 bg-white dark:bg-zinc-800/50 px-2 py-0.5 rounded-full border border-gray-200 dark:border-transparent">{visibleTasks.length}</span>
                  </div>
                  
                  <StrictModeDroppable droppableId={column.id} isDropDisabled={isViewer}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-3 min-h-[150px] overflow-y-auto flex flex-col gap-3 ${
                          snapshot.isDraggingOver && !searchQuery ? 'bg-gray-200/50 dark:bg-zinc-800/20' : ''
                        } transition-colors rounded-b-xl`}
                      >
                        {visibleTasks.map((task, index) => (
                           <TaskCard 
                               key={task.id} 
                               task={task} 
                               index={index} 
                               onClickEdit={setEditingTask} 
                               onClickDelete={(id) => setDeleteData({ taskId: id, columnId: column.id })} 
                               isDragDisabled={!!searchQuery || isViewer} 
                               readOnly={isViewer} 
                               isDone={column.id === 'col-4'} 
                           />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </StrictModeDroppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* --- Modals --- */}
      {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} onSave={handleUpdateTask} />}

      {deleteData && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 w-full max-w-sm p-6 relative animate-in zoom-in duration-200 shadow-2xl">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2"><AlertTriangle className="text-red-500" size={20}/> Delete Task?</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Are you sure you want to delete this?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeleteData(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
                    <button onClick={confirmDeleteTask} className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-lg">Delete</button>
                </div>
            </div>
        </div>
      )}

      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 relative animate-in zoom-in duration-200 shadow-2xl">
                <button onClick={() => setIsInviteOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"><X size={20} /></button>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Invite Members</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">Give your team access.</p>
                
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Email</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-zinc-400 dark:text-zinc-500" size={18} />
                            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Role / Position</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 text-zinc-400 dark:text-zinc-500" size={18} />
                            <select 
                                value={inviteRole} 
                                onChange={(e) => setInviteRole(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="member">Member (Can edit tasks)</option>
                                <option value="admin">Admin (Full access)</option>
                                <option value="viewer">Viewer (Read only)</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="submit" disabled={inviteLoading} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors">
                            {inviteLoading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;