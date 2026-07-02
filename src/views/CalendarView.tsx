import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, AlertCircle, CheckCircle2, Trash2, Edit2, X, CheckCircle } from 'lucide-react';
import { useProject, Record } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  onAddRecord?: () => void;
}

export default function CalendarView({ onAddRecord }: CalendarViewProps) {
  const { records, activeProject, updateRecord, deleteRecords } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 21)); // March 21, 2026
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Record>>({});

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();

  const projectRecords = useMemo(() => {
    return records.filter(r => r.projectId === activeProject?.id && (r.type === 'event' || r.type === 'task'));
  }, [records, activeProject]);

  const upcomingRecords = useMemo(() => {
    return projectRecords
      .filter(r => new Date(r.date) >= new Date(2026, 2, 21))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [projectRecords]);

  const getRecordsForDay = (day: number) => {
    return projectRecords.filter(r => {
      const d = new Date(r.date);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === year;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 2, 21));
  };

  const handleRecordClick = (record: Record) => {
    setSelectedRecord(record);
    setEditForm(record);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedRecord && editForm) {
      updateRecord(selectedRecord.id, editForm);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    }
  };

  const handleDeleteRecord = () => {
    if (selectedRecord) {
      if (confirm('Are you sure you want to delete this record?')) {
        deleteRecords([selectedRecord.id]);
        setIsEditModalOpen(false);
        setSelectedRecord(null);
      }
    }
  };

  const handleToggleComplete = () => {
    if (selectedRecord) {
      const newStatus = selectedRecord.status === 'verified' ? 'open' : 'verified';
      updateRecord(selectedRecord.id, { status: newStatus, verified: newStatus === 'verified' });
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-legal-navy">Calendar</h1>
          <p className="text-slate-500 mt-2">Date-driven projection of project reality</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-1 rounded-xl border border-legal-border shadow-sm">
          <button className="px-4 py-2 bg-legal-navy text-white rounded-lg text-sm font-medium">Month</button>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">Week</button>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">List</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 glass-panel overflow-hidden flex flex-col">
          <div className="p-6 border-b border-legal-border flex items-center justify-between bg-slate-50/50">
            <h3 className="font-serif text-xl font-bold">{monthName} {year}</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleToday}
                className="px-4 py-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-sm font-medium transition-all"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-legal-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-r border-legal-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1 min-h-[600px]">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 border-r border-b border-legal-border bg-slate-50/30" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === 21 && currentDate.getMonth() === 2 && year === 2026;
              const dayRecords = getRecordsForDay(day);
              
              return (
                <div 
                  key={day} 
                  className={`p-2 border-r border-b border-legal-border last:border-r-0 relative group hover:bg-slate-50/50 transition-colors min-h-[120px]`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-white bg-amber-600 w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-600'}`}>
                    {day}
                  </span>
                  
                    <div className="mt-2 space-y-1">
                      {dayRecords.map(record => (
                        <button 
                          key={record.id}
                          onClick={() => handleRecordClick(record)}
                          className={`w-full text-left p-1 rounded text-[10px] font-bold truncate border-l-2 transition-all hover:brightness-95 ${
                            record.type === 'event' 
                              ? 'bg-blue-50 border-blue-500 text-blue-700' 
                              : 'bg-amber-50 border-amber-500 text-amber-700'
                          } ${record.status === 'verified' ? 'opacity-50 line-through' : ''}`}
                        >
                          {record.title}
                        </button>
                      ))}
                    </div>

                  <button 
                    onClick={onAddRecord}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white border border-slate-200 rounded shadow-sm text-slate-400 hover:text-legal-navy transition-all"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              );
            })}

            {/* Empty cells after last day to fill the grid (optional) */}
            {Array.from({ length: (7 - (firstDayOfMonth + daysInMonth) % 7) % 7 }).map((_, i) => (
              <div key={`empty-end-${i}`} className="p-2 border-r border-b border-legal-border bg-slate-50/30 last:border-r-0" />
            ))}
          </div>
        </div>

        {/* Sidebar - Upcoming */}
        <div className="space-y-6">
          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4 flex items-center">
              <CalendarIcon size={18} className="mr-2 text-amber-600" />
              Upcoming
            </h3>
            <div className="space-y-4">
              {upcomingRecords.length > 0 ? (
                upcomingRecords.map(record => (
                  <UpcomingItem 
                    key={record.id}
                    date={new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                    title={record.title} 
                    type={record.type === 'event' ? 'Event' : 'Task'} 
                    color={record.type === 'event' ? 'bg-blue-500' : 'bg-amber-500'} 
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No upcoming events.</p>
              )}
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Filters</h3>
            <div className="space-y-2">
              <FilterToggle label="Events" color="bg-blue-500" active />
              <FilterToggle label="Tasks" color="bg-amber-500" active />
              <FilterToggle label="Expenses" color="bg-emerald-500" />
              <FilterToggle label="Documents" color="bg-indigo-500" />
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && selectedRecord && (
          <EditRecordModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            record={selectedRecord}
            onSave={handleSaveEdit}
            onDelete={handleDeleteRecord}
            onToggleComplete={handleToggleComplete}
            editForm={editForm}
            setEditForm={setEditForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UpcomingItem({ date, title, type, color }: any) {
  return (
    <div className="flex items-start space-x-3 group cursor-pointer">
      <div className={`w-1 h-10 rounded-full ${color} group-hover:scale-y-110 transition-transform`} />
      <div>
        <p className="text-xs font-bold text-slate-400">{date}</p>
        <p className="text-sm font-bold text-legal-navy group-hover:text-amber-600 transition-colors">{title}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{type}</p>
      </div>
    </div>
  );
}

function EditRecordModal({ isOpen, onClose, record, onSave, onDelete, onToggleComplete, editForm, setEditForm }: any) {
  if (!isOpen || !record) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 bg-legal-navy text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${record.type === 'event' ? 'bg-blue-500' : 'bg-amber-500'}`}>
              {record.type === 'event' ? <CalendarIcon size={20} /> : <Clock size={20} />}
            </div>
            <div>
              <h3 className="font-bold">Edit {record.type === 'event' ? 'Event' : 'Task'}</h3>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">Record Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
              <input 
                type="text" 
                value={editForm.title || ''}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                <input 
                  type="date" 
                  value={editForm.date || ''}
                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                <input 
                  type="text" 
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
              <textarea 
                rows={3}
                value={editForm.description || ''}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50">
            <button 
              onClick={onDelete}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <div className="flex-1" />
            <button 
              onClick={onToggleComplete}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                record.status === 'verified' 
                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {record.status === 'verified' ? <Clock size={16} /> : <CheckCircle size={16} />}
              {record.status === 'verified' ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button 
              onClick={onSave}
              className="px-8 py-3 bg-legal-navy text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FilterToggle({ label, color, active }: any) {
  const [isActive, setIsActive] = useState(active);
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-slate-600 group-hover:text-legal-navy transition-colors">{label}</span>
      </div>
      <div 
        onClick={() => setIsActive(!isActive)}
        className={`w-8 h-4 rounded-full relative transition-colors ${isActive ? 'bg-legal-navy' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isActive ? 'right-1' : 'left-1'}`} />
      </div>
    </label>
  );
}

