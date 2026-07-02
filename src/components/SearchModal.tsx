import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Filter, Calendar, CheckCircle2, Clock, FileText, DollarSign, Briefcase, ArrowRight, CheckSquare } from 'lucide-react';
import { useProject, Record } from '../context/ProjectContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
}

export default function SearchModal({ isOpen, onClose, initialQuery }: SearchModalProps) {
  const { records, activeProject } = useProject();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const filteredResults = useMemo(() => {
    if (!query && filters.type === 'all' && filters.status === 'all' && filters.dateRange === 'all') return [];

    return records.filter(record => {
      if (activeProject && record.projectId !== activeProject.id) return false;

      const matchesQuery = !query || 
        record.title.toLowerCase().includes(query.toLowerCase()) ||
        record.description?.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = filters.type === 'all' || record.type === filters.type;
      const matchesStatus = filters.status === 'all' || record.status === filters.status;
      
      // Advanced date filtering
      let matchesDate = true;
      const recordDate = new Date(record.date);
      const now = new Date();
      
      if (filters.dateRange === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = recordDate >= sevenDaysAgo;
      } else if (filters.dateRange === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = recordDate >= thirtyDaysAgo;
      } else if (filters.dateRange === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        matchesDate = recordDate >= startOfYear;
      }

      return matchesQuery && matchesType && matchesStatus && matchesDate;
    });
  }, [records, query, filters, activeProject]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-legal-navy/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400" size={20} />
            <input 
              autoFocus
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records, evidence, and analysis..." 
              className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-xl text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 transition-all"
            />
            <button 
              onClick={onClose}
              className="absolute right-4 p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Filter size={14} className="text-slate-400" />
              <FilterSelect 
                value={filters.type} 
                onChange={(v) => setFilters(f => ({ ...f, type: v }))}
                options={[
                  { label: 'All Types', value: 'all' },
                  { label: 'Events', value: 'event' },
                  { label: 'Tasks', value: 'task' },
                  { label: 'Documents', value: 'document' },
                  { label: 'Expenses', value: 'expense' },
                ]}
              />
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <CheckCircle2 size={14} className="text-slate-400" />
              <FilterSelect 
                value={filters.status} 
                onChange={(v) => setFilters(f => ({ ...f, status: v }))}
                options={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Verified', value: 'verified' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Open', value: 'open' },
                  { label: 'Completed', value: 'completed' },
                ]}
              />
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Calendar size={14} className="text-slate-400" />
              <FilterSelect 
                value={filters.dateRange} 
                onChange={(v) => setFilters(f => ({ ...f, dateRange: v }))}
                options={[
                  { label: 'Any Time', value: 'all' },
                  { label: 'Last 7 Days', value: '7d' },
                  { label: 'Last 30 Days', value: '30d' },
                  { label: 'This Year', value: 'year' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px] bg-white">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <SearchResultItem key={result.id} record={result} onClick={onClose} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No records found matching your search</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{filteredResults.length} results found</span>
          <div className="flex items-center space-x-4">
            <span>ESC to close</span>
            <span>ENTER to select</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: { label: string, value: string }[] }) {
  return (
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer hover:text-legal-navy transition-all"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}


function SearchResultItem({ record, onClick }: any) {
  const Icon = {
    event: Clock,
    task: CheckSquare,
    document: FileText,
    expense: DollarSign
  }[record.type];

  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-legal-navy hover:shadow-md transition-all group text-left"
    >
      <div className={`p-2 rounded-lg mr-4 ${
        record.type === 'event' ? 'bg-blue-50 text-blue-600' :
        record.type === 'task' ? 'bg-amber-50 text-amber-600' :
        record.type === 'document' ? 'bg-indigo-50 text-indigo-600' :
        'bg-emerald-50 text-emerald-600'
      }`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-legal-navy truncate">{record.title}</h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">{record.date}</span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-1">{record.description || 'No description available'}</p>
      </div>
      <ArrowRight size={16} className="ml-4 text-slate-200 group-hover:text-legal-navy transition-colors" />
    </button>
  );
}
