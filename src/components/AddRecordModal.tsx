import React, { useState } from 'react';
import { X, Plus, Calendar, CheckSquare, FileText, DollarSign, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject, Record } from '../context/ProjectContext';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: Record['type'];
}

export default function AddRecordModal({ isOpen, onClose, initialType = 'task' }: AddRecordModalProps) {
  const { activeProject, addRecord } = useProject();
  const [type, setType] = useState<Record['type']>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState<Record['priority']>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    const newRecord: Omit<Record, 'id'> = {
      projectId: activeProject.id,
      type,
      title,
      description,
      date,
      status: type === 'task' ? 'pending' : 'verified',
      priority: type === 'task' ? priority : undefined,
      amount: type === 'expense' ? parseFloat(amount) : undefined,
      verified: type !== 'task',
    };

    addRecord(newRecord);
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setAmount('');
  };

  if (!isOpen) return null;

  const types = [
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'event', label: 'Event', icon: Clock },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'expense', label: 'Expense', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-legal-navy/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 bg-legal-navy text-white flex items-center justify-between">
          <h3 className="text-xl font-bold">Add New Record</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selector */}
          <div className="grid grid-cols-4 gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as any)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  type === t.id 
                    ? 'border-legal-navy bg-legal-navy/5 text-legal-navy' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <t.icon size={20} />
                <span className="text-[10px] font-bold uppercase mt-1">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${type} title...`}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
                />
              </div>
              {type === 'expense' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
                  />
                </div>
              ) : type === 'task' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 resize-none"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-legal-navy text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Record</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
