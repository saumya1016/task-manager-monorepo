import React, { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Layout } from 'lucide-react';
import TaskCard from './TaskCard';

// Helper moved here since it's used by the column
export const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

const BoardColumn = ({ column, tasks, searchQuery, priorityFilter, isViewer, onEdit, onDelete }) => {
  
  // 1. Handle filtering logic inside the column component
  const visibleTasks = column.taskIds.map((taskId) => tasks[taskId]).filter(task => {
    if (!task) return false;
    const matchesSearch = task.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="w-80 shrink-0 flex flex-col h-full bg-gray-100/50 dark:bg-zinc-900/30 rounded-xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
      
      {/* Column Header */}
      <div className="flex justify-between items-center p-4 pb-2">
        <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{column.title}</h2>
        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 bg-white dark:bg-zinc-800/50 px-2 py-0.5 rounded-full border border-gray-200 dark:border-transparent">
          {visibleTasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      {/* FIX 1: Removed `!!searchQuery || priorityFilter !== 'All'` from isDropDisabled */}
      <StrictModeDroppable droppableId={column.id} isDropDisabled={isViewer}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 p-3 min-h-[150px] overflow-y-auto flex flex-col gap-3 ${
              snapshot.isDraggingOver 
                ? 'bg-indigo-50/50 dark:bg-indigo-900/10 ring-2 ring-inset ring-indigo-500/20' 
                : ''
            } transition-all rounded-b-xl`}
          >
            {visibleTasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                onClickEdit={onEdit} 
                onClickDelete={(id) => onDelete({ taskId: id, columnId: column.id })} 
                // FIX 2: Removed filter checks from isDragDisabled
                isDragDisabled={isViewer} 
                readOnly={isViewer} 
                isDone={column.id === 'col-4'} 
              />
            ))}
            
            {provided.placeholder}

            {/* Empty State */}
            {visibleTasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-full opacity-30 min-h-[120px]">
                <div className="p-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-full mb-2">
                  <Layout size={20} />
                </div>
                <p className="text-xs font-medium text-zinc-500">No tasks</p>
              </div>
            )}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default BoardColumn;