import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Pencil, Trash2, Calendar, AlignLeft, CheckCircle2, Tag } from 'lucide-react';

const getPriorityColor = (priority, isDone) => {
  if (isDone) return 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-zinc-800 dark:text-zinc-600 dark:border-zinc-700';
  switch (priority) {
    case 'High': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    case 'Medium': return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30';
    case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
    default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date().setHours(0,0,0,0);
};

const TaskCard = ({ task, index, onClickEdit, onClickDelete, isDragDisabled, isDone }) => {
  return (
    <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`
            bg-white dark:bg-zinc-900 
            border border-gray-200 dark:border-zinc-800 
            p-4 rounded-xl group relative w-full
            
            /* --- TRANSITIONS --- */
            ${snapshot.isDragging ? '' : 'transition-colors duration-200'}

            /* --- DRAG STATE (Fixed: No Rotation) --- */
            ${snapshot.isDragging 
                ? 'shadow-2xl shadow-black/20 ring-2 ring-indigo-500/50 z-50 bg-gray-50 dark:bg-zinc-800' 
                : 'hover:border-indigo-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-black/20'
            }
            ${isDragDisabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}

            /* --- DONE STATE --- */
            ${isDone ? 'opacity-60 bg-gray-50/50 dark:bg-zinc-900/50' : ''}
          `}
        >
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-zinc-900/90 p-1 rounded backdrop-blur-sm border border-gray-200 dark:border-zinc-800 z-10">
            <button onClick={() => onClickEdit(task)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white"><Pencil size={13} /></button>
            <button onClick={() => onClickDelete(task.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-500/20 rounded text-gray-400 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"><Trash2 size={13} /></button>
          </div>
          
          <div className="flex gap-2 mb-3">
             {isDone && <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
             
             <p className={`text-sm font-medium leading-snug break-words pr-6
                ${isDone 
                   ? 'line-through text-gray-400 dark:text-zinc-600 decoration-gray-400 dark:decoration-zinc-600' 
                   : 'text-gray-700 dark:text-zinc-200'
                }
             `}>
               {task.content}
             </p>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Badge */}
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority, isDone)}`}>
                {task.priority}
              </span>

              {/* NEW: Tag Badge */}
              {task.tag && task.tag !== 'General' && (
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 flex items-center gap-1">
                   <Tag size={10} /> {task.tag}
                </span>
              )}
              
              {task.description && (
                <div className="text-gray-400 dark:text-zinc-500" title="Has description">
                  <AlignLeft size={14} />
                </div>
              )}

              {task.deadline && (
                <div className={`flex items-center gap-1 text-[10px] font-semibold 
                  ${isDone 
                    ? 'text-gray-300 dark:text-zinc-600 line-through decoration-gray-300' 
                    : (isOverdue(task.deadline) ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-zinc-500')
                  }
                `}>
                   <Calendar size={12} />
                   {formatDate(task.deadline)}
                </div>
              )}
            </div>
            
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border
               ${isDone 
                 ? 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-zinc-800 dark:text-zinc-600 dark:border-zinc-700' 
                 : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
               }
            `}>
                {task.assignee ? task.assignee.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;