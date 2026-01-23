import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd'; 
import { Loader2, AlertTriangle, Users, X } from 'lucide-react'; 
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

  // State for Filtering by Member
  const [filterUserId, setFilterUserId] = useState(null); 

  // Task & Column Data
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({
    'col-1': { id: 'col-1', title: 'Assigned', taskIds: [] },
    'col-2': { id: 'col-2', title: 'In Progress', taskIds: [] },
    'col-3': { id: 'col-3', title: 'Review', taskIds: [] },
    'col-4': { id: 'col-4', title: 'Done', taskIds: [] },
  });
  const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  
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

      // --- Robust Role Detection ---
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const myId = userInfo?._id?.toString();
      const myEmail = userInfo?.email; 

      const ownerId = (board.owner?._id || board.owner)?.toString();

      if (ownerId === myId) {
          setUserRole('admin'); 
      } else {
          // Robust check: matches by ID OR Email
          const memberEntry = board.members.find(m => {
              const mId = m.user?._id ? m.user._id.toString() : (m.user ? m.user.toString() : '');
              const mEmail = m.user?.email || m.email; 
              return (mId && mId === myId) || (mEmail && mEmail === myEmail);
          });
          
          if (memberEntry) {
              // Clean Logic: Trust the DB role
              setUserRole(memberEntry.role || 'member'); 
          } else {
              // Fallback: If not in list, they are a viewer
              setUserRole('viewer');
          }
      }

      // Load Tasks
      const { data: taskData } = await axios.get('/tasks', { params: { boardId } });
      const newTasks = {};
      const newColumns = { ...columns };
      Object.keys(newColumns).forEach(key => newColumns[key].taskIds = []);
      
      taskData.forEach(task => { 
        newTasks[task._id] = { id: task._id, ...task }; 
        if (newColumns[task.status]) newColumns[task.status].taskIds.push(task._id); 
      });
      setTasks(newTasks); 
      setColumns(newColumns);

    } catch (error) { 
      console.error(error);
      toast.error("Failed to load board");
    } finally { setLoading(false); }
  };

  const onDragEnd = async (result) => {
    // 1. Basic Checks
    if (userRole === 'viewer' || !result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];
    
    // Check if filtering is active
    const isFiltered = filterUserId || searchQuery || priorityFilter !== 'All';

    // --- LOGIC FOR MOVING ---
    const startTaskIds = Array.from(start.taskIds);
    const finishTaskIds = Array.from(finish.taskIds);

    // 1. Remove from Source
    const realSourceIndex = startTaskIds.indexOf(draggableId);
    if (realSourceIndex === -1) return;
    startTaskIds.splice(realSourceIndex, 1);

    // 2. Insert into Destination
    let realDestinationIndex = destination.index;

    // 🌟 Calculate Real Destination if Filtered (Smart Insert)
    if (isFiltered) {
        const visibleTaskIds = getFilteredTaskIds(destination.droppableId);
        
        if (visibleTaskIds.length === 0) {
            realDestinationIndex = 0;
        } else if (destination.index === 0) {
            const firstVisibleId = visibleTaskIds[0];
            realDestinationIndex = finishTaskIds.indexOf(firstVisibleId);
            if (realDestinationIndex === -1) realDestinationIndex = 0;
        } else if (destination.index >= visibleTaskIds.length) {
            const lastVisibleId = visibleTaskIds[visibleTaskIds.length - 1];
            realDestinationIndex = finishTaskIds.indexOf(lastVisibleId) + 1;
        } else {
            const itemAtSpotId = visibleTaskIds[destination.index];
            realDestinationIndex = finishTaskIds.indexOf(itemAtSpotId);
        }
    }
    if (realDestinationIndex < 0) realDestinationIndex = 0;
    
    // Apply Move
    if (start === finish) {
       startTaskIds.splice(realDestinationIndex, 0, draggableId);
       setColumns({ ...columns, [start.id]: { ...start, taskIds: startTaskIds } });
    } else {
       finishTaskIds.splice(realDestinationIndex, 0, draggableId);
       setColumns({
           ...columns,
           [start.id]: { ...start, taskIds: startTaskIds },
           [finish.id]: { ...finish, taskIds: finishTaskIds },
       });
    }

    // 3. API Update
    if (destination.droppableId === 'col-4') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    try { 
        await axios.put(`/tasks/${draggableId}`, { status: destination.droppableId }); 
    } catch { 
        toast.error("Move failed"); 
        fetchBoardData(); // Revert
    }
  };

  const handleCreateTask = async () => {
    if(!newTaskContent.trim()) return;
    try {
      const { data } = await axios.post('/tasks', { 
        content: newTaskContent, status: 'col-1', tag: newTag.trim() || 'General', priority: newPriority, deadline: newDeadline, boardId 
      });
      const newTask = { id: data._id, ...data };
      setTasks(prev => ({ ...prev, [data._id]: newTask }));
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
      toast.success("Task updated");
    } catch { toast.error("Update failed"); }
  };

  const confirmDeleteTask = async () => {
    if (!deleteData) return;
    try {
      await axios.delete(`/tasks/${deleteData.taskId}`);
      const newIds = columns[deleteData.columnId].taskIds.filter(id => id !== deleteData.taskId);
      setColumns(prev => ({ ...prev, [deleteData.columnId]: { ...prev[deleteData.columnId], taskIds: newIds } }));
      const newTasks = { ...tasks }; delete newTasks[deleteData.taskId]; setTasks(newTasks);
      setDeleteData(null); toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
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

  if (loading) return <div className="h-screen bg-white dark:bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    // Clean Layout with h-screen to prevent scroll issues
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-300">
      <Toaster position="bottom-right" theme={isDarkMode ? "dark" : "light"} richColors />
      
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <BoardNavbar 
        boardTitle={boardTitle} isViewer={userRole === 'viewer'} 
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
        onInvite={() => setIsInviteOpen(true)} currentUser={currentUser}
      />

      <div className="flex-1 p-8 overflow-x-auto overflow-y-hidden relative z-10">
        
        {/* --- Header Row --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative">
           
           {/* Left Side: Title & Info */}
           <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                {boardTitle}
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                  {boardId ? boardId.slice(-4) : '...'}
                </span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Manage and track your project tasks.</p>
           </div>

           {/* Right Side: Unified Filter Pill */}
           <div className="flex items-center gap-3">
              
              <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full p-1 shadow-sm gap-1 pl-1 pr-3">
                 
                 {/* Avatars Stack (Overlapping) */}
                 <div className="flex -space-x-2 mr-2">
                    {members.map(member => (
                        <button
                            key={member._id}
                            onClick={() => setFilterUserId(filterUserId === member._id ? null : member._id)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold uppercase transition-all relative hover:z-10 
                                ${filterUserId === member._id 
                                    ? 'border-indigo-500 z-20 ring-2 ring-indigo-100 dark:ring-indigo-900 bg-indigo-600 text-white' 
                                    : 'border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                                }`}
                            title={member.name}
                        >
                            {member.name.substring(0,2)}
                        </button>
                    ))}
                 </div>

                 {/* Separator */}
                 <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-1"></div>

                 {/* "My Tasks" Text Button */}
                 <button
                    onClick={() => setFilterUserId(filterUserId === currentUser?._id ? null : currentUser?._id)}
                    className={`text-xs font-medium px-2 py-1.5 rounded-full transition-colors ${
                       filterUserId === currentUser?._id 
                       ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' 
                       : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                    }`}
                 >
                    My Tasks
                 </button>
                 
                 {/* Clear (X) Button */}
                 {filterUserId && (
                   <button 
                      onClick={() => setFilterUserId(null)}
                      className="ml-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Clear Filter"
                   >
                      <X size={14} />
                   </button>
                 )}
              </div>

              {/* New Task Button (Admin Only) */}
              {userRole === 'admin' && (
                 <NewTaskBar 
                   isCreating={isCreating} setIsCreating={setIsCreating}
                   newTaskContent={newTaskContent} setNewTaskContent={setNewTaskContent}
                   newTag={newTag} setNewTag={setNewTag}
                   newPriority={newPriority} setNewPriority={setNewPriority}
                   newDeadline={newDeadline} setNewDeadline={setNewDeadline}
                   handleCreateTask={handleCreateTask}
                 />
              )}
           </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-[calc(100vh-14rem)] pb-4 min-w-max">
            {columnOrder.map(id => {
              const filteredColumn = {
                  ...columns[id],
                  taskIds: getFilteredTaskIds(id) 
              };

              return (
                <BoardColumn 
                  key={id} 
                  column={filteredColumn} 
                  tasks={tasks}
                  searchQuery={searchQuery} 
                  priorityFilter={priorityFilter}
                  isViewer={userRole === 'viewer'} 
                  onEdit={setEditingTask} 
                  onDelete={setDeleteData}
                />
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {editingTask && (
        <EditTaskModal 
            task={editingTask} 
            members={members} 
            onClose={() => setEditingTask(null)} 
            onSave={handleUpdateTask} 
        />
      )}
      
      {deleteData && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 w-full max-w-sm p-6 shadow-2xl">
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><AlertTriangle className="text-red-500" size={20}/> Delete Task?</h2>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setDeleteData(null)} className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
                    <button onClick={confirmDeleteTask} className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg">Delete</button>
                </div>
            </div>
        </div>
      )}

      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} boardId={boardId} />
    </div>
  );
};

export default ProjectBoard;