import React, { useMemo, useState } from 'react';
import { Clock, Plus, Filter, CheckCircle2, AlertCircle, FileText, Phone, Users, Gavel, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { motion } from 'framer-motion';

interface EventsViewProps {
  onAddRecord?: () => void;
}

export default function EventsView({ onAddRecord }: EventsViewProps) {
  const { records, activeProject } = useProject();
  const [filter, setFilter] = useState('all');

  const events = useMemo(() => {
    let filtered = records.filter(r => r.projectId === activeProject?.id && r.type === 'event');
    if (filter === 'hearings') filtered = filtered.filter(e => e.title.toLowerCase().includes('hearing') || e.title.toLowerCase().includes('court'));
    if (filter === 'calls') filtered = filtered.filter(e => e.title.toLowerCase().includes('call') || e.title.toLowerCase().includes('phone'));
    if (filter === 'filings') filtered = filtered.filter(e => e.title.toLowerCase().includes('filing') || e.title.toLowerCase().includes('filed'));
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, activeProject, filter]);

  const stats = useMemo(() => {
    const allEvents = records.filter(r => r.projectId === activeProject?.id && r.type === 'event');
    return {
      total: allEvents.length,
      verified: allEvents.filter(e => e.verified).length,
      hearings: allEvents.filter(e => e.title.toLowerCase().includes('hearing') || e.title.toLowerCase().includes('conference')).length,
      calls: allEvents.filter(e => e.title.toLowerCase().includes('call') || e.title.toLowerCase().includes('phone')).length,
      meetings: allEvents.filter(e => e.title.toLowerCase().includes('meeting') || e.title.toLowerCase().includes('consultation')).length,
      filings: allEvents.filter(e => e.title.toLowerCase().includes('filing') || e.title.toLowerCase().includes('filed')).length,
    };
  }, [records, activeProject]);

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('call') || t.includes('phone')) return Phone;
    if (t.includes('filing') || t.includes('filed')) return FileText;
    if (t.includes('meeting') || t.includes('consultation')) return Users;
    if (t.includes('hearing') || t.includes('court') || t.includes('conference')) return Gavel;
    return Clock;
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">Events</h1>
          <p className="text-slate-500 mt-2">Canonical record of project occurrences and factual history</p>
        </div>
        <button 
          onClick={onAddRecord}
          className="flex items-center justify-center space-x-2 bg-legal-navy text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Log Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex bg-white p-1 rounded-lg border border-legal-border shadow-sm flex-shrink-0">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'all' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                All Events
              </button>
              <button 
                onClick={() => setFilter('hearings')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'hearings' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                Hearings
              </button>
              <button 
                onClick={() => setFilter('calls')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'calls' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                Calls
              </button>
              <button 
                onClick={() => setFilter('filings')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === 'filings' ? 'bg-slate-100 text-legal-navy' : 'text-slate-500 hover:text-legal-navy'}`}
              >
                Filings
              </button>
            </div>
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-legal-border transition-all flex-shrink-0">
              <Filter size={18} />
            </button>
          </div>

          <div className="space-y-8 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-px before:bg-slate-100">
            {events.length > 0 ? (
              <div className="space-y-6">
                {events.map((event) => (
                  <EventRow 
                    key={event.id}
                    icon={getIcon(event.title)} 
                    title={event.title} 
                    time={new Date(event.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} 
                    status={event.verified ? 'verified' : 'pending'}
                    description={event.description}
                    tags={event.title.toLowerCase().includes('call') ? ['Communication'] : ['Procedural']}
                  />
                ))}
              </div>
            ) : (
              <div className="ml-0 sm:ml-12 py-12 text-center glass-panel">
                <p className="text-slate-400 italic">No events recorded for this matter.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Event Types</h3>
            <div className="space-y-3">
              <TypeStat label="Hearings" count={stats.hearings} color="bg-blue-500" />
              <TypeStat label="Calls" count={stats.calls} color="bg-amber-500" />
              <TypeStat label="Meetings" count={stats.meetings} color="bg-indigo-500" />
              <TypeStat label="Filings" count={stats.filings} color="bg-emerald-500" />
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Integrity Check</h3>
            <div className={`p-4 rounded-xl border ${stats.verified === stats.total ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className={`flex items-center space-x-2 mb-2 ${stats.verified === stats.total ? 'text-emerald-700' : 'text-amber-700'}`}>
                {stats.verified === stats.total ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="font-bold text-sm">
                  {stats.verified === stats.total ? 'All Events Verified' : `${stats.total - stats.verified} Pending Verification`}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${stats.verified === stats.total ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stats.verified === stats.total 
                  ? 'Every event in the current matter has been cross-referenced with supporting evidence.'
                  : 'Some events require additional documentation or verification to ensure a complete chain of evidence.'}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


function EventRow({ icon: Icon, title, time, status, description, tags }: any) {
  return (
    <div className="flex space-x-4 sm:space-x-6 relative group">
      <div className="z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-legal-navy group-hover:text-legal-navy transition-all shadow-sm flex-shrink-0">
        <Icon size={18} className="sm:size-20" />
      </div>
      <div className="flex-1 glass-panel p-4 sm:p-6 group-hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-base sm:text-lg text-legal-navy leading-tight">{title}</h4>
            <div className="flex gap-1">
              {tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 whitespace-nowrap">{time}</span>
            {status === 'verified' ? (
              <CheckCircle2 size={14} className="text-emerald-500 sm:size-16" />
            ) : (
              <AlertCircle size={14} className="text-amber-500 sm:size-16" />
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 sm:line-clamp-none">{description}</p>
        <div className="mt-4 flex items-center space-x-4">
          <button className="text-[9px] sm:text-[10px] font-bold text-slate-400 hover:text-legal-navy uppercase tracking-widest">View Evidence</button>
          <button className="text-[9px] sm:text-[10px] font-bold text-slate-400 hover:text-legal-navy uppercase tracking-widest">Edit Entry</button>
        </div>
      </div>
    </div>
  );
}

function TypeStat({ label, count, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
}

