import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd'; 
import { Loader2, AlertTriangle, X, Sparkles, LogOut } from 'lucide-react'; 
import axios from '../utils/axios';
import { useNavigate, useParams } from 'react-router-dom'; 
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';

// Import Cleaned Components
import BoardNavbar from '../components/board/BoardNavbar'; 
import NewTaskBar from '../components/board/NewTaskBar';   
import BoardColumn from '../components/BoardColumn';
import EditTaskModal from '../components/EditTaskModal';
import InviteUserModal from '../components/InviteUserModal'; 

const ProjectBoard = () => {
  const navigate = useNavigate();
  const { id: boardId } = useParams(); 
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boardTitle, setBoardTitle] = useState('Project Board');
  
  const [userRole, setUserRole] = useState('viewer'); 
  const [members, setMembers] = useState([]); 
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Filtering & Search
  const [filterUserId, setFilterUserId] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Task & Column Data
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({
    'col-1': { id: 'col-1', title: 'Assigned', taskIds: [] },
    'col-2': { id: 'col-2', title: 'In Progress', taskIds: [] },
    'col-3': { id: 'col-3', title: 'Review', taskIds: [] },
    'col-4': { id: 'col-4', title: 'Done', taskIds: [] },
  });
  const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4'];
  
  // UI Modals State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false); 
  const [isCreating, setIsCreating] = useState(false);

  // New Task Fields
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTag, setNewTag] = useState('');

  // --- Theme Effect ---
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

  // --- Auth & Initial Load ---
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) { navigate('/login'); return; }
    setCurrentUser(userInfo);
    if (boardId) fetchBoardData();
  }, [boardId]);

  // --- API Calls ---
  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const { data: board } = await axios.get(`/boards/${boardId}`);
      setBoardTitle(board.title);
      
      // 1. Setup Members List
      const allMembers = [];
      if (board.owner) allMembers.push(board.owner);
      if (board.members?.length > 0) {
          const validMembers = board.members
            .map(m => m.user)
            .filter(u => u && u._id);
          allMembers.push(...validMembers);
      }
      setMembers(allMembers);

      // 2. Role Detection
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const myId = userInfo?._id?.toString();
      const ownerId = (board.owner?._id || board.owner)?.toString();

      if (ownerId === myId) {
          setUserRole('admin'); 
      } else {
          const memberEntry = board.members.find(m => 
            (m.user?._id?.toString() === myId) || (m.user?.toString() === myId)
          );
          setUserRole(memberEntry?.role || 'viewer'); 
      }

      // 3. Load Tasks
      const { data: taskData } = await axios.get('/tasks', { params: { boardId } });
      const newTasks = {};
      const newColumns = {
        'col-1': { id: 'col-1', title: 'Assigned', taskIds: [] },
        'col-2': { id: 'col-2', title: 'In Progress', taskIds: [] },
        'col-3': { id: 'col-3', title: 'Review', taskIds: [] },
        'col-4': { id: 'col-4', title: 'Done', taskIds: [] },
      };
      
      taskData.forEach(task => { 
        newTasks[task._id] = { id: task._id, ...task }; 
        if (newColumns[task.status]) {
          newColumns[task.status].taskIds.push(task._id);
        }
      });

      setTasks(newTasks); 
      setColumns(newColumns);

    } catch (error) { 
      if (error.response?.status === 404) {
        toast.error("Workspace not found or deleted");
        navigate('/dashboard');
      } else {
        toast.error("Failed to load board");
      }
    } finally { setLoading(false); }
  };

  const handleLeaveWorkspace = async () => {
    try {
      setLoading(true);
      await axios.put(`/boards/${boardId}/leave`);
      toast.success("Successfully left the workspace");
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave");
      setLoading(false);
      setShowLeaveModal(false);
    }
  };

  const getFilteredTaskIds = (columnId) => {
    return columns[columnId].taskIds.filter((taskId) => {
        const task = tasks[taskId];
        if (!task) return false;
        const matchesSearch = task.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
        const matchesMember = !filterUserId || task.assignedTo === filterUserId;
        return matchesSearch && matchesPriority && matchesMember;
    });
  };

  const onDragEnd = async (result) => {
    if (userRole === 'viewer' || !result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);

    if (start === finish) {
        startTaskIds.splice(destination.index, 0, draggableId);
        setColumns({ ...columns, [start.id]: { ...start, taskIds: startTaskIds } });
    } else {
        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        setColumns({
            ...columns,
            [start.id]: { ...start, taskIds: startTaskIds },
            [finish.id]: { ...finish, taskIds: finishTaskIds },
        });
    }

    if (destination.droppableId === 'col-4') {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7'] });
    }

    try { await axios.put(`/tasks/${draggableId}`, { status: destination.droppableId }); } 
    catch { toast.error("Sync failed"); fetchBoardData(); }
  };

  const handleCreateTask = async () => {
    if(!newTaskContent.trim()) return;
    try {
      const { data } = await axios.post('/tasks', { 
        content: newTaskContent, status: 'col-1', tag: newTag.trim() || 'General', priority: newPriority, deadline: newDeadline, boardId 
      });
      setTasks(prev => ({ ...prev, [data._id]: { id: data._id, ...data } }));
      setColumns(prev => ({ ...prev, 'col-1': { ...prev['col-1'], taskIds: [...prev['col-1'].taskIds, data._id] } }));
      setNewTaskContent(''); setIsCreating(false);
      toast.success("Task created");
    } catch { toast.error("Failed to create task"); }
  };

  const handleUpdateTask = async (updatedData) => {
    try {
      const { data } = await axios.put(`/tasks/${updatedData.id}`, updatedData);
      setTasks(prev => ({ ...prev, [updatedData.id]: { ...prev[updatedData.id], ...data } }));
      setEditingTask(null); 
      toast.success("Changes saved");
    } catch { toast.error("Save failed"); }
  };

  const confirmDeleteTask = async () => {
    if (!deleteData) return;
    try {
      await axios.delete(`/tasks/${deleteData.taskId}`);
      const newIds = columns[deleteData.columnId].taskIds.filter(id => id !== deleteData.taskId);
      setColumns(prev => ({ ...prev, [deleteData.columnId]: { ...prev[deleteData.columnId], taskIds: newIds } }));
      const newTasks = { ...tasks }; delete newTasks[deleteData.taskId]; setTasks(newTasks);
      setDeleteData(null); toast.success("Task removed");
    } catch { toast.error("Deletion failed"); }
  };

  if (loading) return (
    <div className="h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 font-sans">Syncing Workspace...</p>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">
      <Toaster position="bottom-right" theme={isDarkMode ? "dark" : "light"} richColors />
      
      {/* Background Mesh */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* ✅ Navbar handles the Leave Icon */}
      <BoardNavbar 
        boardTitle={boardTitle} 
        isViewer={userRole === 'viewer'} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter} 
        setPriorityFilter={setPriorityFilter}
        onInvite={() => setIsInviteOpen(true)} 
        currentUser={currentUser}
        userRole={userRole}
        onLeave={() => setShowLeaveModal(true)} 
      />

      <div className="flex-1 p-6 md:p-10 overflow-x-auto overflow-y-hidden relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
           <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black tracking-tighter">{boardTitle}</h1>
                <div className="px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-[10px] font-black uppercase text-zinc-400">ID: {boardId?.slice(-6)}</div>
              </div>
              <p className="text-sm font-medium text-zinc-500">Collaborate and manage project milestones.</p>
           </div>

           <div className="flex items-center gap-4">
              {/* ✅ CLEANED MEMBER FILTER PILL */}
              <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-sm gap-2 px-4">
                 <div className="flex -space-x-2.5">
                    {members.slice(0, 5).map(member => (
                        <button
                            key={member._id}
                            onClick={() => setFilterUserId(filterUserId === member._id ? null : member._id)}
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-black uppercase transition-all relative hover:z-10 hover:scale-110
                                ${filterUserId === member._id ? 'border-indigo-500 z-20 bg-indigo-600 text-white' : 'border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
                        >
                            {member.name.substring(0,2)}
                        </button>
                    ))}
                 </div>
                 <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                 <button
                    onClick={() => setFilterUserId(filterUserId === currentUser?._id ? null : currentUser?._id)}
                    className={`text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all ${filterUserId === currentUser?._id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'text-zinc-400 hover:text-zinc-900'}`}
                 >
                    My Tasks
                 </button>
                 
                 {filterUserId && (
                   <button onClick={() => setFilterUserId(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                 )}
              </div>

              {userRole === 'admin' && (
                 <NewTaskBar 
                   isCreating={isCreating} setIsCreating={setIsCreating} newTaskContent={newTaskContent} setNewTaskContent={setNewTaskContent}
                   newTag={newTag} setNewTag={setNewTag} newPriority={newPriority} setNewPriority={setNewPriority}
                   newDeadline={newDeadline} setNewDeadline={setNewDeadline} handleCreateTask={handleCreateTask}
                 />
              )}
           </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 h-[calc(100vh-16rem)] pb-6 min-w-max">
            {columnOrder.map(id => (
              <BoardColumn key={id} column={{ ...columns[id], taskIds: getFilteredTaskIds(id) }} tasks={tasks} searchQuery={searchQuery} priorityFilter={priorityFilter} isViewer={userRole === 'viewer'} onEdit={setEditingTask} onDelete={setDeleteData} />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* --- Modals --- */}
      {editingTask && <EditTaskModal task={editingTask} members={members} onClose={() => setEditingTask(null)} onSave={handleUpdateTask} />}
      
      {deleteData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 w-full max-w-sm p-10 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
                <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">Delete Task?</h2>
                <div className="flex flex-col gap-3 mt-8">
                    <button onClick={confirmDeleteTask} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Confirm Delete</button>
                    <button onClick={() => setDeleteData(null)} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-bold text-xs">Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 w-full max-w-sm p-10 shadow-2xl text-center font-sans">
                <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <LogOut size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2 uppercase italic">Leave?</h2>
                <p className="text-sm text-zinc-500 mb-8 font-medium italic">You'll need a new invite to return.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={handleLeaveWorkspace} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20">Yes, Leave</button>
                    <button onClick={() => setShowLeaveModal(false)} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-bold text-xs transition-all">Go Back</button>
                </div>
            </div>
        </div>
      )}

      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} boardId={boardId} />
    </div>
  );
};

export default ProjectBoard;