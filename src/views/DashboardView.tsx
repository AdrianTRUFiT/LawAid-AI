import React, { useMemo, useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  FileCheck, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  MoreHorizontal,
  BrainCircuit,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Loader2,
  ShieldAlert,
  ClipboardList,
  ArrowRightCircle,
  Activity,
  ShieldCheck as ShieldCheckIcon,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject } from '../context/ProjectContext';
import { summarizeProject, chatWithAssistant } from '../lib/geminiService';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const { records, activeProject, signals, setRepresentationState, wellness } = useProject();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeSignals = useMemo(() => {
    return signals.filter(s => s.projectId === activeProject?.id && s.status === 'active');
  }, [signals, activeProject]);

  // Calculate metrics based on real records
  const metrics = useMemo(() => {
    const projectRecords = records.filter(r => r.projectId === activeProject?.id);
    
    const pendingTasks = projectRecords.filter(r => r.type === 'task' && r.status === 'pending').length;
    const urgentTasks = projectRecords.filter(r => r.type === 'task' && r.priority === 'High').length;
    
    const events = projectRecords.filter(r => r.type === 'event').length;
    const nextEvent = projectRecords
      .filter(r => r.type === 'event' && new Date(r.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const expenses = projectRecords.filter(r => r.type === 'expense');
    const totalExpenses = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const verifiedExpenses = expenses.filter(r => r.verified).length;

    const documents = projectRecords.filter(r => r.type === 'document').length;
    const verifiedDocs = projectRecords.filter(r => r.type === 'document' && r.verified).length;

    return {
      pendingTasks,
      urgentTasks,
      events,
      nextEventDate: nextEvent ? new Date(nextEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None',
      totalExpenses: totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      verifiedExpenses,
      documents,
      verifiedDocs,
      recentRecords: projectRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    };
  }, [records, activeProject]);

  const financialRecords = useMemo(() => {
    return records
      .filter(r => r.projectId === activeProject?.id && r.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [records, activeProject]);

  useEffect(() => {
    if (activeProject) {
      generateSummary();
    }
  }, [activeProject]);

  const generateSummary = async () => {
    if (!activeProject) return;
    setIsSummaryLoading(true);
    const summary = await summarizeProject(activeProject, records.filter(r => r.projectId === activeProject.id));
    setAiSummary(summary || "No summary available.");
    setIsSummaryLoading(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsChatLoading(true);

    const response = await chatWithAssistant(userMsg, records.filter(r => r.projectId === activeProject?.id), chatHistory);
    
    setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response || "I'm sorry, I couldn't process that." }] }]);
    setIsChatLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const intakeProgress = useMemo(() => {
    if (!activeProject?.intake) return 0;
    const steps = [
      activeProject.intake.matterInfo?.matterType ? 1 : 0,
      (activeProject.intake.parties?.length || 0) > 0 ? 1 : 0,
      (activeProject.intake.witnesses?.length || 0) > 0 ? 1 : 0,
      (activeProject.intake.timeline?.length || 0) > 0 ? 1 : 0,
      (activeProject.intake.evidence?.length || 0) > 0 ? 1 : 0,
      (activeProject.intake.recollections?.length || 0) > 0 ? 1 : 0,
    ];
    return Math.round((steps.reduce((a, b) => a + b, 0) / 6) * 100);
  }, [activeProject]);

  return (
    <div className="space-y-8 pb-20">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-3xl md:text-4xl font-bold text-legal-navy truncate">Your Inhabited Legal State</h1>
            <div className="flex flex-wrap gap-1.5">
              {activeProject?.representationState === 'pro_se' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 whitespace-nowrap">PRO SE</span>
              )}
              {activeProject?.representationState === 'transitioning' && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200 whitespace-nowrap">TRANSITIONING</span>
              )}
            </div>
          </div>
          <p className="text-slate-500 mt-2 truncate">Personal record system for {activeProject?.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100 flex items-center whitespace-nowrap">
            <ShieldCheck size={16} className="mr-2 flex-shrink-0" />
            Record Integrity: High
          </div>
          
          {/* Representation State Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setRepresentationState('represented')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${activeProject?.representationState === 'represented' ? 'bg-legal-navy text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Represented
            </button>
            <button 
              onClick={() => setRepresentationState('transitioning')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${activeProject?.representationState === 'transitioning' ? 'bg-legal-navy text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Transitioning
            </button>
            <button 
              onClick={() => setRepresentationState('pro_se')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${activeProject?.representationState === 'pro_se' ? 'bg-legal-navy text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Pro Se
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Chat Bar */}
      <div className="relative">
        <motion.div 
          layoutId="ai-chat-bar"
          onClick={() => setIsChatOpen(true)}
          className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-legal-navy/20 transition-all cursor-pointer flex items-center group"
        >
          <div className="p-2 bg-legal-navy text-white rounded-lg mr-4 group-hover:scale-110 transition-transform">
            <BrainCircuit size={20} />
          </div>
          <div className="flex-1 text-slate-400 font-medium">
            Assist your case state
          </div>
          <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
            Guided
          </div>
        </motion.div>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 md:w-[500px] md:h-[600px] bg-white z-50 shadow-2xl rounded-none md:rounded-3xl border border-slate-200 flex flex-col overflow-hidden"
            >
              <div className="p-4 bg-legal-navy text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <BrainCircuit size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">LawAidAI Assistant</h3>
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest">Project Intelligence</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <MessageSquare size={32} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-600">How can I help you today?</p>
                      <p className="text-sm text-slate-400 max-w-[250px] mx-auto mt-1">
                        Ask about your documents, upcoming events, or financial records.
                      </p>
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.role === 'model' && (
                      <span className="text-[10px] font-bold text-legal-navy uppercase tracking-widest mb-1 ml-1">
                        AI Assistant
                      </span>
                    )}
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-legal-navy text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
                    }`}>
                      <div className="markdown-body">
                        <Markdown>{msg.parts[0].text}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                      <Loader2 size={16} className="animate-spin text-legal-navy" />
                      <span className="text-sm text-slate-500">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 focus:border-slate-300 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatMessage.trim() || isChatLoading}
                  className="p-3 bg-legal-navy text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-legal-navy/20"
                >
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <MetricCard 
          label="Readiness" 
          value={`${wellness.readinessScore}%`} 
          subValue={wellness.alignmentStatus} 
          icon={ShieldCheckIcon} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
          onClick={() => onNavigate('wellness')}
        />
        <MetricCard 
          label="Stress Load" 
          value={`${wellness.stressLoad}%`} 
          subValue={wellness.burnoutRisk + ' Risk'} 
          icon={Zap} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
          onClick={() => onNavigate('wellness')}
        />
        <MetricCard 
          label="Required Actions" 
          value={(metrics.pendingTasks + activeSignals.length).toString()} 
          subValue={`${metrics.urgentTasks} Urgent`} 
          icon={AlertCircle} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
          onClick={() => onNavigate('tasks')}
        />
        <MetricCard 
          label="Milestones" 
          value={metrics.events.toString()} 
          subValue={`Next: ${metrics.nextEventDate}`} 
          icon={Clock} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
          onClick={() => onNavigate('calendar')}
        />
        <MetricCard 
          label="Financial Total" 
          value={metrics.totalExpenses} 
          subValue={`${metrics.verifiedExpenses} Verified`} 
          icon={TrendingUp} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
          onClick={() => onNavigate('expenses')}
        />
        <MetricCard 
          label="Evidence Count" 
          value={metrics.documents.toString()} 
          subValue={`${metrics.verifiedDocs} Verified`} 
          icon={FileCheck} 
          color="text-indigo-600" 
          bgColor="bg-indigo-50" 
          onClick={() => onNavigate('documents')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Timeline Panel */}
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Project Timeline</h3>
              <button 
                onClick={() => onNavigate('calendar')}
                className="text-sm text-slate-500 hover:text-legal-navy flex items-center transition-colors"
              >
                View Calendar <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="space-y-6">
              {metrics.recentRecords.length > 0 ? (
                metrics.recentRecords.map((record) => (
                  <TimelineItem 
                    key={record.id}
                    date={new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                    title={record.title} 
                    description={record.description}
                    status={record.verified ? 'verified' : 'pending'}
                    onClick={() => onNavigate(record.type + 's')}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400 italic">No recent activity recorded.</p>
                </div>
              )}
            </div>
          </section>

          {/* Financial Record Panel */}
          <section className="glass-panel p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Financial Record</h3>
              <button 
                onClick={() => onNavigate('expenses')}
                className="text-sm text-slate-500 hover:text-legal-navy transition-colors"
              >
                View Ledger
              </button>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {financialRecords.length > 0 ? (
                    financialRecords.map((record) => (
                      <tr 
                        key={record.id} 
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => onNavigate('expenses')}
                      >
                        <td className="py-4 font-medium truncate max-w-[200px]">{record.title}</td>
                        <td className="py-4 text-slate-500 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="py-4 font-mono whitespace-nowrap">{(record.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            record.verified 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {record.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">No financial records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column - Analysis & Position */}
        <div className="space-y-8">
          {/* Your Inhabited Legal State Panel - AI Refined */}
          <section className="bg-legal-navy text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-bold">Position Summary</h3>
                <Sparkles size={18} className="text-amber-400" />
              </div>
              
              <div className="space-y-4 mb-6">
                <PositionStat label="Records Captured" value={metrics.recentRecords.length.toString()} />
                <PositionStat label="Verified Chain" value={`${Math.round((metrics.verifiedDocs / (metrics.documents || 1)) * 100)}%`} />
                <PositionStat label="Active Signals" value={activeSignals.length.toString()} />
                <PositionStat 
                  label="Rep. Status" 
                  value={activeProject?.representationState?.replace('_', ' ').toUpperCase() || 'UNKNOWN'} 
                  color={activeProject?.representationState === 'represented' ? 'text-emerald-400' : 'text-amber-400'}
                />
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold flex items-center">
                  <BrainCircuit size={10} className="mr-1" />
                  AI Synthesis
                </p>
                {isSummaryLoading ? (
                  <div className="flex items-center space-x-2 py-4">
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                    <span className="text-xs text-slate-400 italic">Synthesizing case data...</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed line-clamp-6">
                    {aiSummary || "No summary available."}
                  </p>
                )}
                <button 
                  onClick={generateSummary}
                  className="mt-3 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center"
                >
                  Refresh Analysis <ArrowRight size={10} className="ml-1" />
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Integrity State</span>
                  <span className="text-[10px] text-emerald-400 font-bold">STABLE</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[88%]" />
                </div>
              </div>
            </div>
          </section>

          {/* Performance Wellness Snapshot Panel */}
          <section className="glass-panel p-6 border-l-4 border-l-legal-navy">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="text-legal-navy" size={20} />
                <h3 className="font-bold">Performance Wellness</h3>
              </div>
              <button 
                onClick={() => onNavigate('wellness')}
                className="text-[10px] font-bold text-legal-navy uppercase tracking-widest hover:underline"
              >
                Full View
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Readiness</p>
                  <p className="text-lg font-bold text-legal-navy">{wellness.readinessScore}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Burnout Risk</p>
                  <p className={`text-lg font-bold ${
                    wellness.burnoutRisk === 'Low' ? 'text-emerald-600' :
                    wellness.burnoutRisk === 'Medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{wellness.burnoutRisk}</p>
                </div>
              </div>
              
              <div className="p-3 bg-legal-navy/5 rounded-xl border border-legal-navy/10">
                <p className="text-[10px] font-bold text-legal-navy uppercase tracking-widest mb-1">Alignment Recommendation</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {wellness.burnoutRisk === 'Low' ? 'Maintain current preparation rhythm. You are in a high-performance state.' :
                   wellness.burnoutRisk === 'Medium' ? 'Monitor sleep quality. Schedule a 48-hour low-exposure reset if fatigue persists.' :
                   'Critical Redline Warning. Initiate emergency re-alignment protocol immediately.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Next High-Stakes Event</span>
                <span className="font-bold text-legal-navy">Mediation (April 12)</span>
              </div>
            </div>
          </section>

          {/* Position Signals Panel */}
          <section className="glass-panel p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="text-amber-600" size={20} />
                <h3 className="font-bold">Position Signals</h3>
              </div>
              {activeSignals.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                  {activeSignals.length} ACTIVE
                </span>
              )}
            </div>
            
            {activeSignals.length > 0 ? (
              <div className="space-y-3">
                {activeSignals.slice(0, 2).map(signal => (
                  <div key={signal.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{signal.type}</span>
                      <span className="text-[10px] text-slate-400">{signal.confidence} Confidence</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">{signal.description}</p>
                  </div>
                ))}
                <button 
                  onClick={() => onNavigate('signals')}
                  className="w-full py-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center justify-center"
                >
                  View All Signals <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 italic">No active signals detected.</p>
                <button 
                  onClick={() => onNavigate('signals')}
                  className="mt-2 text-xs font-bold text-legal-navy hover:underline"
                >
                  Run Signal Engine
                </button>
              </div>
            )}
          </section>

          {/* Recent Evidence Panel */}
          <section className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4">Recent Evidence</h3>
            <div className="space-y-4">
              {records
                .filter(r => r.projectId === activeProject?.id && r.type === 'document')
                .slice(0, 3)
                .map(doc => (
                  <EvidenceItem 
                    key={doc.id}
                    title={doc.title} 
                    type={doc.title.split('.').pop()?.toUpperCase() || 'FILE'} 
                    date={new Date(doc.date).toLocaleDateString()} 
                    onClick={() => onNavigate('documents')}
                  />
                ))
              }
            </div>
            <button 
              onClick={() => onNavigate('documents')}
              className="mt-6 w-full text-center text-sm text-slate-500 hover:text-legal-navy font-medium transition-colors"
            >
              Browse SoulVault
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon: Icon, color, bgColor, onClick }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="glass-panel p-5 flex items-start justify-between cursor-pointer group"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-legal-navy transition-colors truncate">{label}</p>
        <h4 className="text-xl md:text-2xl font-bold mt-1 text-legal-navy truncate">{value}</h4>
        <p className="text-[10px] text-slate-400 mt-1 truncate">{subValue}</p>
      </div>
      <div className={`p-2 rounded-lg ${bgColor} ${color} group-hover:scale-110 transition-transform flex-shrink-0`}>
        <Icon size={20} />
      </div>
    </motion.div>
  );
}

function TimelineItem({ date, title, description, status, onClick }: any) {
  return (
    <div className="flex space-x-4 cursor-pointer group" onClick={onClick}>
      <div className="flex flex-col items-center">
        <div className="text-[10px] font-bold text-slate-400 w-10 text-right">{date}</div>
        <div className="w-px flex-1 bg-slate-100 my-2" />
      </div>
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-legal-navy truncate group-hover:text-amber-600 transition-colors">{title}</h4>
          {status === 'verified' ? (
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <Clock size={14} className="text-amber-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2 break-words">{description}</p>
      </div>
    </div>
  );
}

function PositionStat({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xs font-mono font-bold ${color || ''}`}>{value}</span>
    </div>
  );
}

function EvidenceItem({ title, type, date, onClick }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-legal-navy group-hover:text-white transition-colors flex-shrink-0">
          {type}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate group-hover:text-legal-navy transition-colors">{title}</p>
          <p className="text-[10px] text-slate-400">{date}</p>
        </div>
      </div>
      <MoreHorizontal size={14} className="text-slate-300 flex-shrink-0 ml-2" />
    </div>
  );
}
