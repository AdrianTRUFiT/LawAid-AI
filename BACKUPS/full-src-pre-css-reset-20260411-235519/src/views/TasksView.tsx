import React, { useMemo, useState } from 'react';
import { CheckSquare, Plus, Filter, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { motion } from 'motion/react';

interface TasksViewProps {
  onAddRecord?: () => void;
}

export default function TasksView({ onAddRecord }: TasksViewProps) {
  const { records, activeProject, updateRecord } = useProject();
  const [filter, setFilter] = useState<'open' | 'completed' | 'all'>('open');

  const tasks = useMemo(() => {
    let filtered = records.filter(r => r.projectId === activeProject?.id && r.type === 'task');
    if (filter === 'open') filtered = filtered.filter(t => t.status === 'open');
    if (filter === 'completed') filtered = filtered.filter(t => t.status === 'completed');
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, activeProject, filter]);

  const urgentTasks = useMemo(() => {
    return records.filter(r => r.projectId === activeProject?.id && r.type === 'task' && r.priority === 'Urgent' && r.status === 'open');
  }, [records, activeProject]);

  const stats = useMemo(() => {
    const allTasks = records.filter(r => r.projectId === activeProject?.id && r.type === 'task');
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const total = allTasks.length;
    return {
      open: total - completed,
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [records, activeProject]);

  const handleToggleTask = (task: any) => {
    updateRecord(task.id, { 
      status: task.status === 'completed' ? 'open' : 'completed',
      verified: task.status !== 'completed' // Auto-verify on complete for demo
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">Required Actions</h1>
          <p className="text-slate-500 mt-2">Enforcement layer for project progress and verification</p>
        </div>
        <button 
          onClick={onAddRecord}
          className="flex items-center justify-center space-x-2 bg-legal-navy text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add Action</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex bg-white p-1 rounded-lg border border-legal-border shadow-sm flex-shrink-0">
              <button 
                onClick={() => setFilter('open')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'open' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                Open
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'completed' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'all' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                All
              </button>
            </div>
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-legal-border transition-all flex-shrink-0">
              <Filter size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskCard 
                  key={task.id}
                  title={task.title} 
                  dueDate={new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                  priority={task.priority} 
                  status={task.status === 'completed' ? 'completed' : 'open'}
                  description={task.description}
                  onToggle={() => handleToggleTask(task)}
                />
              ))
            ) : (
              <div className="py-12 text-center glass-panel">
                <p className="text-slate-400 italic">No tasks found for this filter.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4 flex items-center">
              <AlertCircle size={18} className="mr-2 text-amber-600" />
              Urgent Actions
            </h3>
            <div className="space-y-4">
              {urgentTasks.length > 0 ? (
                urgentTasks.map(task => (
                  <div key={task.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Due Soon</p>
                    <p className="text-sm font-medium text-amber-900 mt-1">{task.title}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No urgent actions pending.</p>
              )}
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Task Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Open</span>
                <span className="text-sm font-bold">{stats.open}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Completed</span>
                <span className="text-sm font-bold">{stats.completed}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.rate}%` }}
                  className="bg-emerald-500 h-full rounded-full" 
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">{stats.rate}% Completion Rate</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ title, dueDate, priority, status, description, onToggle }: any) {
  const isCompleted = status === 'completed';
  
  return (
    <div className={`glass-panel p-4 md:p-6 flex items-start space-x-3 md:space-x-4 transition-all ${isCompleted ? 'opacity-60' : 'hover:shadow-md hover:border-slate-300'}`}>
      <button 
        onClick={onToggle}
        className={`mt-1 w-5 h-5 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-legal-navy'}`}
      >
        {isCompleted && <CheckCircle2 size={14} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className={`font-bold text-base md:text-lg truncate ${isCompleted ? 'line-through text-slate-400' : 'text-legal-navy'}`}>{title}</h4>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              priority === 'Urgent' ? 'bg-red-50 text-red-600' : 
              priority === 'High' ? 'bg-amber-50 text-amber-600' : 
              priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
            }`}>
              {priority}
            </span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center whitespace-nowrap">
              <Clock size={10} className="mr-1" />
              {isCompleted ? 'Completed' : dueDate}
            </span>
          </div>
        </div>
        <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2 md:line-clamp-none">{description}</p>
      </div>
    </div>
  );
}

