import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, Search, UserPlus, X, Loader2, AlertTriangle, Sun, Moon, Layout, Filter, Tag } from 'lucide-react';
import axios from '../utils/axios';
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';

// Components
import BoardColumn from '../components/BoardColumn';
import EditTaskModal from '../components/EditTaskModal';
import InviteUserModal from '../components/InviteUserModal'; // NEW IMPORT

const ProjectBoard = () => {
  const navigate = useNavigate();
  const { id: boardId } = useParams(); // Get Board ID from URL
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Board Data State
  const [boardData, setBoardData] = useState(null); // Stores board name, members, etc.

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark' || true);

  // Task & Column State
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({
    'col-1': { id: 'col-1', title: 'Assigned', taskIds: [] },
    'col-2': { id: 'col-2', title: 'In Progress', taskIds: [] },
    'col-3': { id: 'col-3', title: 'Review', taskIds: [] },
    'col-4': { id: 'col-4', title: 'Done', taskIds: [] },
  });
  const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4'];
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  
  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTag, setNewTag] = useState('');

  // --- Effects ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }
    setCurrentUser(userInfo);
    fetchBoardData(); // Fetch Board + Tasks
  }, [boardId, navigate]);

  const isViewer = currentUser?.role === 'viewer'; 

  // --- Fetch Logic ---
  const fetchBoardData = async () => {
    try {
      // 1. Fetch Board Details (Name, Members)
      // Note: You need to create this GET /api/boards/:id route in backend if not exists
      // If not, we can just fetch tasks, but we won't show members.
      if (boardId) {
          const boardRes = await axios.get(`/boards/${boardId}`);
          setBoardData(boardRes.data);
      }

      // 2. Fetch Tasks (Assuming tasks are filtered by board on backend, or we fetch all)
      const { data } = await axios.get('/tasks', { params: { boardId } });
      
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
    } catch (error) { 
      toast.error("Failed to load board data"); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- Drag & Drop ---
  const onDragEnd = async (result) => {
    if (searchQuery || priorityFilter !== 'All' || isViewer) return;
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (destination.droppableId === 'col-4' && source.droppableId !== 'col-4') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

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
      
      try { await axios.put(`/tasks/${draggableId}`, { status: destination.droppableId }); } 
      catch (error) { toast.error("Failed to move task"); fetchBoardData(); }
    }
  };

  // --- CRUD Operations ---
  const handleCreateTask = async () => {
    if(!newTaskContent.trim()) return;
    try {
      const { data } = await axios.post('/tasks', { 
        content: newTaskContent, 
        status: 'col-1', 
        tag: newTag.trim() || 'General', 
        priority: newPriority, 
        deadline: newDeadline,
        boardId: boardId // Associate task with this board
      });
      
      const newTask = { id: data._id, ...data };
      const newCol = { ...columns['col-1'], taskIds: [...columns['col-1'].taskIds, data._id] };
      setTasks({ ...tasks, [data._id]: newTask });
      setColumns({ ...columns, 'col-1': newCol });
      
      setNewTaskContent(''); setIsCreating(false); toast.success("Task created");
    } catch (error) { toast.error("Failed to create task"); }
  };

  const confirmDeleteTask = async () => {
    if (!deleteData) return;
    try {
      await axios.delete(`/tasks/${deleteData.taskId}`);
      const newColTaskIds = columns[deleteData.columnId].taskIds.filter(id => id !== deleteData.taskId);
      setColumns({ ...columns, [deleteData.columnId]: { ...columns[deleteData.columnId], taskIds: newColTaskIds } });
      const newTasks = { ...tasks };
      delete newTasks[deleteData.taskId];
      setTasks(newTasks);
      toast.success("Task deleted"); setDeleteData(null);
    } catch (error) { toast.error("Failed to delete task"); }
  };

  const handleUpdateTask = async (updatedData) => {
    try {
      const { data } = await axios.put(`/tasks/${updatedData.id}`, updatedData);
      setTasks({ ...tasks, [updatedData.id]: { ...tasks[updatedData.id], ...data } });
      setEditingTask(null); toast.success("Task updated");
    } catch (error) { toast.error("Failed to update task"); }
  };

  if (loading) return <div className="h-screen bg-white dark:bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-300">
      <Toaster position="bottom-right" theme={isDarkMode ? "dark" : "light"} richColors />
      
      {/* Background */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 sticky top-0 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Layout size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">TaskFlow</span>
        </div>
        
        <div className="ml-auto flex items-center gap-6">
           <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-full border border-transparent dark:border-zinc-800">
             <div className="relative group pl-3 flex items-center gap-2">
               <Search className="text-zinc-400" size={16} />
               <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-sm w-32 md:w-48 outline-none" />
             </div>
             <div className="h-5 w-[1px] bg-gray-300 dark:bg-zinc-700 mx-1"></div>
             <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-transparent border-none text-xs font-semibold outline-none cursor-pointer pl-2 pr-2">
                 <option value="All">All</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
             </select>
           </div>

           <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800"><Sun size={18} /></button>
           
           {!isViewer && (
             <button onClick={() => setIsInviteOpen(true)} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors">
                <UserPlus size={18} /> <span className="hidden md:inline">Invite</span>
             </button>
           )}

           <button onClick={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} className="text-xs text-red-500 font-medium">Logout</button>
           
           <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
             {currentUser.name?.charAt(0).toUpperCase()}
           </div>
        </div>
      </nav>

      {/* Board Header & Content */}
      <div className="flex-1 p-8 overflow-x-auto overflow-y-hidden relative z-10">
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
               <h1 className="text-2xl font-bold tracking-tight">{boardData?.name || 'Project Board'}</h1>
               
               {/* Display Member Avatars */}
               {boardData?.members && boardData.members.length > 0 && (
                   <div className="flex -space-x-2">
                       {boardData.members.map((member) => (
                           <div key={member._id} title={member.name} className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-xs text-white font-bold cursor-help">
                               {member.name.charAt(0).toUpperCase()}
                           </div>
                       ))}
                   </div>
               )}
           </div>

           {!isViewer && (
             <div className="flex gap-2">
               {isCreating ? (
                  <div className="flex gap-2 items-center animate-in fade-in slide-in-from-right-4 duration-200 bg-white dark:bg-zinc-900/50 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <input autoFocus type="text" placeholder="Task name..." className="bg-transparent border-none text-sm w-48" value={newTaskContent} onChange={e => setNewTaskContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateTask()} />
                    <button onClick={handleCreateTask} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium">Add</button>
                    <button onClick={() => setIsCreating(false)} className="px-1"><X size={16} /></button>
                  </div>
               ) : ( 
                  <button onClick={() => setIsCreating(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                      <Plus size={16} /> New Issue
                  </button> 
               )}
             </div>
           )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-[calc(100vh-12rem)] pb-4 min-w-max">
            {columnOrder.map((columnId) => (
              <BoardColumn 
                key={columnId}
                column={columns[columnId]}
                tasks={tasks}
                searchQuery={searchQuery}
                priorityFilter={priorityFilter}
                isViewer={isViewer}
                onEdit={setEditingTask}
                onDelete={setDeleteData}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Edit Task Modal (Now receives members!) */}
      {editingTask && (
        <EditTaskModal 
            task={editingTask} 
            onClose={() => setEditingTask(null)} 
            onSave={handleUpdateTask} 
            members={boardData?.members || []} // Pass members here
        />
      )}
      
      {/* 2. Delete Confirmation */}
      {deleteData && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 w-full max-w-sm p-6 shadow-2xl">
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><AlertTriangle className="text-red-500" size={20}/> Delete Task?</h2>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setDeleteData(null)} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={confirmDeleteTask} className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg">Delete</button>
                </div>
            </div>
        </div>
      )}

      {/* 3. New Smart Invite Modal */}
      <InviteUserModal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        boardId={boardId} // Pass the ID
        onInviteSuccess={fetchBoardData} // Refresh to show new avatar
      />
    </div>
  );
};

export default ProjectBoard;