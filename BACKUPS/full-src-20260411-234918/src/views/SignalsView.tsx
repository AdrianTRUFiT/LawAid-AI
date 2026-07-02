import React, { useState, useMemo } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ExternalLink, ChevronRight, Info } from 'lucide-react';
import { useProject, Signal } from '../context/ProjectContext';
import { runSignalEngine } from '../lib/cppsService';
import { motion, AnimatePresence } from 'motion/react';

export default function SignalsView() {
  const { activeProject, records, signals, setSignals, updateSignal } = useProject();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const activeSignals = useMemo(() => {
    return signals.filter(s => s.projectId === activeProject?.id && s.status === 'active');
  }, [signals, activeProject]);

  const resolvedSignals = useMemo(() => {
    return signals.filter(s => s.projectId === activeProject?.id && s.status !== 'active');
  }, [signals, activeProject]);

  const handleRunScan = async () => {
    if (!activeProject) return;
    setIsScanning(true);
    try {
      const newSignals = await runSignalEngine(activeProject.id, records, activeProject.representationState);
      // Filter out duplicate signals based on description if needed, or just append
      // For this demo, we'll just append them
      setSignals(prev => [...prev, ...newSignals]);
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">Audit Trail</h1>
          <p className="text-slate-500 mt-2">Client-side early warning layer for evidence-bound pattern detection</p>
        </div>
        <button 
          onClick={handleRunScan}
          disabled={isScanning}
          className={`flex items-center justify-center space-x-2 bg-legal-navy text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all w-full sm:w-auto ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isScanning ? <RefreshCw size={20} className="animate-spin" /> : <ShieldAlert size={20} />}
          <span>{isScanning ? 'Auditing Records...' : 'Run Audit Layer'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Signals ({activeSignals.length})</h2>
            </div>
            
            {activeSignals.length > 0 ? (
              <div className="space-y-4">
                {activeSignals.map((signal) => (
                  <SignalCard 
                    key={signal.id} 
                    signal={signal} 
                    onSelect={() => setSelectedSignal(signal)}
                    onResolve={() => updateSignal(signal.id, { status: 'resolved' })}
                    onDismiss={() => updateSignal(signal.id, { status: 'dismissed' })}
                    confidenceColor={getConfidenceColor(signal.confidence)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-legal-navy">Position Secure</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">No active signals detected. Your captured records align with current project reality.</p>
              </div>
            )}
          </section>

          {resolvedSignals.length > 0 && (
            <section className="space-y-4 pt-8">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Resolved / Dismissed ({resolvedSignals.length})</h2>
              <div className="space-y-2">
                {resolvedSignals.map((signal) => (
                  <div key={signal.id} className="glass-panel p-4 flex items-center justify-between opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${signal.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <div>
                        <p className="text-sm font-bold text-legal-navy">{signal.type}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(signal.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateSignal(signal.id, { status: 'active' })}
                      className="text-[10px] font-bold text-legal-navy hover:underline uppercase tracking-widest"
                    >
                      Re-activate
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6 bg-slate-900 border-l-4 border-l-legal-navy text-white">
            <h3 className="font-bold mb-4 flex items-center text-white">
              <Info size={18} className="mr-2 text-amber-400" />
              System Doctrine
            </h3>
            <div className="space-y-4 text-xs leading-relaxed">
              <p>
                <span className="font-bold text-amber-400 mr-2 whitespace-nowrap">👉 Early Warning:</span>
                <span className="text-slate-200">Identify patterns inside captured records before confusion, delay, or risk compounds.</span>
              </p>
              <p>
                <span className="font-bold text-amber-400 mr-2 whitespace-nowrap">👉 Evidence-Bound:</span>
                <span className="text-slate-200">This system operates ONLY on captured, timestamped evidence and the structured Case Intake. It does not use assumptions.</span>
              </p>
              <p>
                <span className="font-bold text-amber-400 mr-2 whitespace-nowrap">👉 Position Protection:</span>
                <span className="text-slate-200">Restores your ability to see, question, and protect your position using your own records.</span>
              </p>
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-bold mb-4">Signal Categories</h3>
            <div className="space-y-3">
              <CategoryItem label="Billing Irregularities" />
              <CategoryItem label="Communication Gaps" />
              <CategoryItem label="Timeline Drift" />
              <CategoryItem label="Promise vs Action" />
              <CategoryItem label="Missing Documentation" />
            </div>
          </section>
        </div>
      </div>

      {/* Signal Detail Modal */}
      <AnimatePresence>
        {selectedSignal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-legal-border flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getConfidenceColor(selectedSignal.confidence)}`}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-legal-navy">{selectedSignal.type}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Confidence: {selectedSignal.confidence}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSignal(null)}
                  className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                >
                  <XCircle size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detected Pattern</h4>
                  <p className="text-legal-navy leading-relaxed">{selectedSignal.description}</p>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Supporting Evidence</h4>
                  <div className="space-y-2">
                    {selectedSignal.supportingEvidenceIds.map(id => (
                      <EvidenceLink key={id} recordId={id} />
                    ))}
                  </div>
                </section>

                <section className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center">
                    <AlertTriangle size={14} className="mr-2" />
                    Recommended Clarification Action
                  </h4>
                  <p className="text-amber-900 font-medium leading-relaxed">{selectedSignal.recommendedAction}</p>
                  <button className="mt-4 w-full bg-amber-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-amber-700 transition-all">
                    Add to Required Actions
                  </button>
                </section>
              </div>

              <div className="p-6 border-t border-legal-border bg-slate-50/50 flex items-center justify-end space-x-4">
                <button 
                  onClick={() => {
                    updateSignal(selectedSignal.id, { status: 'dismissed' });
                    setSelectedSignal(null);
                  }}
                  className="px-6 py-2 text-slate-500 font-bold text-sm hover:text-legal-navy transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => {
                    updateSignal(selectedSignal.id, { status: 'resolved' });
                    setSelectedSignal(null);
                  }}
                  className="px-8 py-2 bg-legal-navy text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all"
                >
                  Mark as Resolved
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SignalCard({ signal, onSelect, onResolve, onDismiss, confidenceColor }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-6 hover:shadow-md transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-legal-navy"
      onClick={onSelect}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl ${confidenceColor} flex-shrink-0`}>
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-legal-navy">{signal.type}</h3>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${confidenceColor}`}>
                {signal.confidence} Confidence
              </span>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{signal.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 md:flex-shrink-0">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detected</p>
            <p className="text-xs font-bold text-legal-navy">{new Date(signal.timestamp).toLocaleDateString()}</p>
          </div>
          <ChevronRight size={20} className="text-slate-300 group-hover:text-legal-navy transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

function EvidenceLink({ recordId }: { recordId: string }) {
  const { records } = useProject();
  const record = records.find(r => r.id === recordId);
  
  if (!record) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-legal-border rounded-xl hover:border-slate-300 transition-all group">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
          <ExternalLink size={14} />
        </div>
        <div>
          <p className="text-xs font-bold text-legal-navy">{record.title}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">{record.type} • {new Date(record.date).toLocaleDateString()}</p>
        </div>
      </div>
      <button className="text-[9px] font-bold text-slate-400 group-hover:text-legal-navy uppercase tracking-widest">View Record</button>
    </div>
  );
}

function CategoryItem({ label }: { label: string }) {
  return (
    <div className="flex items-center space-x-3 text-sm text-slate-600">
      <div className="w-1.5 h-1.5 rounded-full bg-legal-navy opacity-30" />
      <span>{label}</span>
    </div>
  );
}
