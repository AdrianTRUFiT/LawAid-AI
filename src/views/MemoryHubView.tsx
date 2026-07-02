import React, { useState } from 'react';
import { BrainCircuit, Shield, Database, ArrowRight, Search, Plus, Filter, MoreHorizontal, Info, Loader2, Sparkles, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject } from '../context/ProjectContext';
import { summarizeProject, findHiddenConnections } from '../lib/geminiService';

type MemoryTab = 'thinkbase' | 'soulvault' | 'soulregistry';

export default function MemoryHubView() {
  const [activeTab, setActiveTab] = useState<MemoryTab>('thinkbase');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">Memory Hub</h1>
          <p className="text-slate-500 mt-2">Centralized routing for project intelligence and private custody</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-legal-border shadow-sm overflow-x-auto scrollbar-hide">
          <TabButton 
            active={activeTab === 'thinkbase'} 
            onClick={() => setActiveTab('thinkbase')} 
            icon={BrainCircuit} 
            label="ThinkBaseAI" 
          />
          <TabButton 
            active={activeTab === 'soulvault'} 
            onClick={() => setActiveTab('soulvault')} 
            icon={Shield} 
            label="SoulVault" 
          />
          <TabButton 
            active={activeTab === 'soulregistry'} 
            onClick={() => setActiveTab('soulregistry')} 
            icon={Database} 
            label="SoulRegistry" 
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'thinkbase' && <ThinkBaseView />}
          {activeTab === 'soulvault' && <SoulVaultView />}
          {activeTab === 'soulregistry' && <SoulRegistryView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
        active 
          ? 'bg-legal-navy text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-legal-navy'
      }`}
    >
      <Icon size={18} className="mr-2 flex-shrink-0" />
      {label}
    </button>
  );
}

function ThinkBaseView() {
  const { records, activeProject } = useProject();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isCorrelating, setIsCorrelating] = useState(false);
  const [connections, setConnections] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!activeProject) return;
    setIsSummarizing(true);
    setSummary(null);
    
    const result = await summarizeProject(activeProject, records.filter(r => r.projectId === activeProject.id));
    setSummary(result || "Unable to generate summary.");
    setIsSummarizing(false);
  };

  const handleCorrelate = async () => {
    if (!activeProject) return;
    setIsCorrelating(true);
    setConnections(null);
    
    const result = await findHiddenConnections(records.filter(r => r.projectId === activeProject.id));
    setConnections(result || "No hidden connections found.");
    setIsCorrelating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="glass-panel p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">ThinkBaseAI</h3>
                <p className="text-xs text-slate-500">Project-scoped working memory & retrieval</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-legal-navy"><Info size={20} /></button>
          </div>
          
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <h4 className="text-sm font-bold text-legal-navy">Project Intelligence Summary</h4>
                  <button 
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{summary ? 'Regenerate Summary' : 'Summarize Project Evidence'}</span>
                  </button>
                </div>
                
                <AnimatePresence mode="wait">
                  {isSummarizing ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 flex flex-col items-center justify-center space-y-3"
                    >
                      <Loader2 size={32} className="text-amber-500 animate-spin" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analyzing evidence...</p>
                    </motion.div>
                  ) : summary ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap"
                    >
                      {summary}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      ThinkBaseAI is the intelligence layer for your active project. It holds the reasoning, summaries, and cross-references derived from your evidence.
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Hidden Connections Section */}
            <div className="bg-indigo-50/30 rounded-xl p-6 border border-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <LinkIcon size={16} className="text-indigo-600" />
                    <h4 className="text-sm font-bold text-legal-navy">Hidden Record Correlations</h4>
                  </div>
                  <button 
                    onClick={handleCorrelate}
                    disabled={isCorrelating}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isCorrelating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{connections ? 'Find More Connections' : 'Uncover Hidden Patterns'}</span>
                  </button>
                </div>
                
                <AnimatePresence mode="wait">
                  {isCorrelating ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 flex flex-col items-center justify-center space-y-3"
                    >
                      <Loader2 size={32} className="text-indigo-500 animate-spin" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Correlating records...</p>
                    </motion.div>
                  ) : connections ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap"
                    >
                      {connections}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Use AI to find non-obvious links between your events, tasks, documents, and expenses.
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Reasoning Threads</h4>
            <ReasoningItem 
              title="Custody Schedule Discrepancy" 
              date="Updated 2h ago" 
              status="Analyzing" 
            />
            <ReasoningItem 
              title="Financial Disclosure Cross-Reference" 
              date="Updated 1d ago" 
              status="Verified" 
            />
            <ReasoningItem 
              title="Mediation Strategy Summary" 
              date="Updated 3d ago" 
              status="Draft" 
            />
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="glass-panel p-6">
          <h3 className="font-bold mb-4">Memory Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Indexed Records</span>
              <span className="text-sm font-bold">{records.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Reasoning Chains</span>
              <span className="text-sm font-bold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Verification Rate</span>
              <span className="text-sm font-bold">92%</span>
            </div>
          </div>
        </section>

        <button className="w-full py-4 bg-legal-navy text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
          <Plus size={20} />
          <span>New Reasoning Thread</span>
        </button>
      </div>
    </div>
  );
}

function SoulVaultView() {
  const { files, activeProject, updateFile } = useProject();
  const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);

  const projectFiles = files.filter(f => f.projectId === activeProject?.id);

  const handleAnalyzeFile = async (file: any) => {
    setAnalyzingFileId(file.id);
    updateFile(file.id, { status: 'analyzing' });
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateFile(file.id, { 
      status: 'analyzed',
      analysis: `AI Analysis for ${file.name}:\n\nThis document contains key patterns related to the active matter. Key entities identified: [Entity A], [Entity B]. Potential timeline drift detected in paragraph 3. Recommended action: Cross-reference with March 15 bank statement.`
    });
    setAnalyzingFileId(null);
  };

  const handlePromoteFile = (fileId: string) => {
    updateFile(fileId, { status: 'promoted' });
    alert('File promoted to ThinkBaseAI for active reasoning.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="glass-panel p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">SoulVault</h3>
                <p className="text-xs text-slate-500">Global private storage (Not AI-ingested by default)</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-legal-navy"><Info size={20} /></button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search private vault..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="space-y-4">
            {projectFiles.length > 0 ? (
              projectFiles.map(file => (
                <VaultItem 
                  key={file.id} 
                  file={file} 
                  onAnalyze={() => handleAnalyzeFile(file)}
                  onPromote={() => handlePromoteFile(file.id)}
                  isAnalyzing={analyzingFileId === file.id}
                />
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <Database size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">No private files uploaded yet.</p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">Upload evidence from the Documents view</p>
              </div>
            )}
            
            <div className="pt-6 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sample Vault Records</h4>
              <VaultItem 
                file={{ name: "Personal_Notes_Confidential.txt", uploadedAt: "2024-03-20T10:00:00Z", size: "12 KB", status: 'stored' }} 
              />
              <VaultItem 
                file={{ name: "Raw_Audio_Recording_Mar15.mp3", uploadedAt: "2024-03-15T14:30:00Z", size: "4.2 MB", status: 'stored' }} 
              />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="glass-panel p-6">
          <h3 className="font-bold mb-4">Vault Security</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <Shield size={20} className="text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Encrypted</p>
                <p className="text-[10px] text-emerald-600">AES-256 Custody Active</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              SoulVault is your private holding tank. Files here are never read by AI unless you explicitly promote them to ThinkBaseAI or trigger a manual analysis.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SoulRegistryView() {
  const { records } = useProject();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="glass-panel p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">SoulRegistry</h3>
                <p className="text-xs text-slate-500">Global verification surface & metadata</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-legal-navy"><Info size={20} /></button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-bold">Record ID</th>
                  <th className="pb-3 font-bold">Type</th>
                  <th className="pb-3 font-bold">Verification</th>
                  <th className="pb-3 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {records.length > 0 ? (
                  records.map(record => (
                    <RegistryRow 
                      key={record.id}
                      id={record.id.toUpperCase()} 
                      type={record.type.charAt(0).toUpperCase() + record.type.slice(1)} 
                      status={record.verified ? 'Verified' : 'Pending'} 
                      time={record.date} 
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">No records found in registry.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="glass-panel p-6">
          <h3 className="font-bold mb-4">Registry Integrity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Records</span>
              <span className="text-sm font-bold">{records.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Integrity Score</span>
              <span className="text-sm font-bold text-emerald-600">99.9%</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ReasoningItem({ title, date, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-amber-200 transition-all cursor-pointer group">
      <div className="flex items-center space-x-4 min-w-0">
        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-legal-navy group-hover:text-amber-700 transition-colors truncate">{title}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{date}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">{status}</span>
        <ArrowRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-all" />
      </div>
    </div>
  );
}

function VaultItem({ file, onAnalyze, onPromote, isAnalyzing }: any) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all group">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors rounded-lg flex-shrink-0">
            <Shield size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-legal-navy truncate">{file.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              {new Date(file.uploadedAt).toLocaleDateString()} • {file.size} • 
              <span className={`ml-1 ${file.status === 'analyzed' ? 'text-emerald-500' : file.status === 'promoted' ? 'text-amber-500' : 'text-slate-400'}`}>
                {file.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {file.status === 'analyzed' && (
            <>
              <button 
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="View Analysis"
              >
                <BrainCircuit size={16} />
              </button>
              <button 
                onClick={onPromote}
                className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition-colors"
                title="Promote to ThinkBaseAI"
              >
                PROMOTE
              </button>
            </>
          )}
          {file.status === 'stored' && onAnalyze && (
            <button 
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : 'ANALYZE'}
            </button>
          )}
          <MoreHorizontal size={16} className="text-slate-300 flex-shrink-0 ml-2" />
        </div>
      </div>
      
      <AnimatePresence>
        {showAnalysis && file.analysis && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              <div className="flex items-center space-x-2 mb-2 text-indigo-700 font-bold uppercase tracking-widest text-[10px]">
                <Sparkles size={12} />
                <span>Intelligence Report</span>
              </div>
              {file.analysis}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RegistryRow({ id, type, status, time }: any) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="py-4 font-mono text-xs font-bold text-slate-600 truncate max-w-[100px]">{id}</td>
      <td className="py-4 text-xs font-medium text-slate-500">{type}</td>
      <td className="py-4">
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
          status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-[10px] font-mono text-slate-400 whitespace-nowrap">{time}</td>
    </tr>
  );
}
