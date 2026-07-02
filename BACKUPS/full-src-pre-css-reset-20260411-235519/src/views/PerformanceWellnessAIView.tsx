import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Zap, 
  Brain, 
  Clock, 
  AlertTriangle, 
  FileWarning, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Moon,
  Wind,
  Target,
  BarChart3,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { useProject } from '../context/ProjectContext';

export default function PerformanceWellnessAIView() {
  const { wellness, addWellnessCheckIn, records, activeProject } = useProject();
  const [showCheckIn, setShowCheckIn] = useState(false);
  
  // Local state for check-in form
  const [checkInData, setCheckInData] = useState({
    stress: 3,
    clarity: 4,
    sleep: 3,
    reactivity: 2,
    recovery: 3,
    confidence: 4,
    notes: ''
  });

  const handleCheckInSubmit = () => {
    addWellnessCheckIn(checkInData);
    setShowCheckIn(false);
  };

  const documentBacklog = records.filter(r => r.projectId === activeProject?.id && r.type === 'document' && !r.verified).length;

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-legal-navy">PerformanceWellnessAI</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Track litigation stamina, readiness, and legal stress so you can stay aligned, responsive, and capable during high-stakes legal events.
          </p>
          <p className="text-xs text-slate-400 mt-1 italic">
            If your performance collapses under legal pressure, your case position can collapse with it.
          </p>
        </div>
        <button 
          onClick={() => setShowCheckIn(true)}
          className="px-6 py-3 bg-legal-navy text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center shadow-lg shadow-legal-navy/20 whitespace-nowrap"
        >
          <Activity size={18} className="mr-2" />
          Daily Check-In
        </button>
      </div>

      {/* Section 1: Performance Wellness Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <OverviewCard label="Readiness Score" value={`${wellness.readinessScore}%`} icon={ShieldCheck} color="text-emerald-600" bgColor="bg-emerald-50" />
        <OverviewCard label="Stress Load" value={`${wellness.stressLoad}%`} icon={Zap} color="text-amber-600" bgColor="bg-amber-50" />
        <OverviewCard label="Decision Clarity" value={`${wellness.decisionClarity}%`} icon={Brain} color="text-blue-600" bgColor="bg-blue-50" />
        <OverviewCard label="Responsiveness" value="High" icon={TrendingUp} color="text-indigo-600" bgColor="bg-indigo-50" />
        <OverviewCard label="Recovery Status" value="Stable" icon={Wind} color="text-cyan-600" bgColor="bg-cyan-50" />
        <OverviewCard label="Urgency Exposure" value="Moderate" icon={Clock} color="text-orange-600" bgColor="bg-orange-50" />
      </div>

      {/* Daily Check-In Modal/Section */}
      {showCheckIn && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 border-2 border-legal-navy/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={() => setShowCheckIn(false)} className="text-slate-400 hover:text-slate-600">
              <ZapOff size={20} />
            </button>
          </div>
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Activity size={24} className="mr-2 text-legal-navy" />
            Legal Performance Check-In
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CheckInSlider label="Stress Today" value={checkInData.stress} onChange={(v) => setCheckInData({...checkInData, stress: v})} icon={Zap} />
            <CheckInSlider label="Clarity Today" value={checkInData.clarity} onChange={(v) => setCheckInData({...checkInData, clarity: v})} icon={Brain} />
            <CheckInSlider label="Sleep Quality" value={checkInData.sleep} onChange={(v) => setCheckInData({...checkInData, sleep: v})} icon={Moon} />
            <CheckInSlider label="Reactivity Level" value={checkInData.reactivity} onChange={(v) => setCheckInData({...checkInData, reactivity: v})} icon={Activity} />
            <CheckInSlider label="Recovery Level" value={checkInData.recovery} onChange={(v) => setCheckInData({...checkInData, recovery: v})} icon={Wind} />
            <CheckInSlider label="Confidence" value={checkInData.confidence} onChange={(v) => setCheckInData({...checkInData, confidence: v})} icon={Target} />
          </div>
          <div className="mt-8">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">What legal issue is creating the most pressure today?</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-legal-navy/5 focus:border-slate-300 transition-all"
              rows={3}
              placeholder="e.g., Upcoming deposition preparation, unresolved discovery requests..."
              value={checkInData.notes}
              onChange={(e) => setCheckInData({...checkInData, notes: e.target.value})}
            />
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button onClick={() => setShowCheckIn(false)} className="px-6 py-2 text-slate-500 font-bold hover:text-slate-700">Cancel</button>
            <button onClick={handleCheckInSubmit} className="px-8 py-2 bg-legal-navy text-white rounded-xl font-bold shadow-lg shadow-legal-navy/20">Save Check-In</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section 3: Deposition Ready Metric */}
          <section className="glass-panel p-6 border-l-4 border-l-legal-navy">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-legal-navy text-white rounded-lg">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Deposition Ready</h3>
                  <p className="text-xs text-slate-500">Readiness for high-stakes legal performance events</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-legal-navy">82%</span>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">High Readiness</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Upcoming Event</p>
                  <p className="font-bold text-legal-navy">Custody Mediation Session</p>
                  <p className="text-xs text-slate-500">April 12, 2024 • 10:00 AM</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current State</p>
                  <p className="text-sm text-slate-700">Stable focus, moderate stress. Preparation is 70% complete.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Risk Note</p>
                  <p className="text-sm text-amber-900">Sleep quality has declined over the last 48 hours. Potential for cognitive fatigue during long sessions.</p>
                </div>
                <div className="p-4 bg-legal-navy text-white rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Alignment Recommendation</p>
                  <p className="text-sm">Prioritize 8 hours of sleep tonight. Schedule a 30-minute mock review session tomorrow morning.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Legal Performance Dashboard */}
          <section className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-6">Legal Performance Dashboard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="pb-4 font-bold">Legal Milestone</th>
                    <th className="pb-4 font-bold">Requirement</th>
                    <th className="pb-4 font-bold">Your Current State</th>
                    <th className="pb-4 font-bold">Alignment Move</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <PerformanceRow 
                    milestone="Deposition" 
                    requirement="High-focus recall" 
                    state="Exhausted / Reactive" 
                    move="3-day prep-only mode / increase sleep" 
                    status="warning"
                  />
                  <PerformanceRow 
                    milestone="Discovery Docs" 
                    requirement="Detail / organization" 
                    state="Avoidant / Overwhelmed" 
                    move="Delegate sorting / 25-min bursts" 
                    status="danger"
                  />
                  <PerformanceRow 
                    milestone="Attorney Consult" 
                    requirement="Strategic thinking" 
                    state="Foggy / Anxious" 
                    move="Review notes first / reduce memory stress" 
                    status="warning"
                  />
                  <PerformanceRow 
                    milestone="Court Hearing" 
                    requirement="Emotional regulation" 
                    state="Stable / Prepared" 
                    move="Maintain current routine / focus on breathing" 
                    status="success"
                  />
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Section 4: Burnout vs. Alignment Indicator */}
          <section className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-6">Burnout vs. Alignment</h3>
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full transition-all duration-1000 ${
                  wellness.burnoutRisk === 'Critical' ? 'bg-red-500 w-[95%]' :
                  wellness.burnoutRisk === 'High' ? 'bg-orange-500 w-[75%]' :
                  wellness.burnoutRisk === 'Medium' ? 'bg-amber-500 w-[50%]' :
                  'bg-emerald-500 w-[20%]'
                }`} 
              />
              <div className="absolute inset-0 flex justify-between px-4 items-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Aligned</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Redline</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-legal-navy uppercase tracking-widest">Current Status</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                wellness.alignmentStatus === 'Aligned' ? 'bg-emerald-100 text-emerald-700' :
                wellness.alignmentStatus === 'Strained' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {wellness.alignmentStatus}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-md mt-0.5 ${wellness.burnoutRisk === 'Low' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Controlled Focus</p>
                  <p className="text-[10px] text-slate-500">Stable task completion and coherent next steps.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-md mt-0.5 ${wellness.burnoutRisk === 'High' || wellness.burnoutRisk === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Emotional Flooding</p>
                  <p className="text-[10px] text-slate-500">Risk of reactivity during attorney communication.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Legal Fatigue Triggers */}
          <section className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4">Legal Fatigue Triggers</h3>
            <div className="flex flex-wrap gap-2">
              <TriggerTag label="Upcoming Deadline" intensity="High" />
              <TriggerTag label="Unresolved Documents" intensity="Medium" />
              <TriggerTag label="Attorney Tension" intensity="Low" />
              <TriggerTag label="Billing Uncertainty" intensity="Medium" />
              <TriggerTag label="Waiting Stress" intensity="High" />
              <TriggerTag label="Record Incompleteness" intensity="Low" />
            </div>
          </section>

          {/* Section 6: Document Readiness as Wellness Marker */}
          <section className="glass-panel p-6 bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Document Readiness</h3>
              <FileWarning size={20} className="text-amber-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Backlog Intensity</span>
                <span className={`text-xs font-bold ${documentBacklog > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {documentBacklog > 5 ? 'CRITICAL' : 'MANAGEABLE'}
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Performance Logic</p>
                <p className="text-xs text-slate-200">
                  If required documents are piling up while your performance wellness is declining, you are in a <span className="text-amber-400 font-bold">Critical Warning Zone</span>.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{documentBacklog}</p>
                  <p className="text-[8px] text-slate-400 uppercase">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">12</p>
                  <p className="text-[8px] text-slate-400 uppercase">Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-400">High</p>
                  <p className="text-[8px] text-slate-400 uppercase">Strain</p>
                </div>
              </div>
              <button className="w-full py-2 bg-amber-500 text-slate-900 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors">
                Outsource Support Needed
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Section 8: Redline Warning / Re-Alignment Protocol */}
      <section className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldAlert size={32} className="text-red-600" />
              <h3 className="text-2xl font-bold text-red-900">Redline Warning</h3>
            </div>
            <p className="text-sm text-red-800 leading-relaxed">
              Identify when you are approaching performance failure and initiate a structured re-alignment response.
            </p>
            <div className="mt-6 space-y-2">
              <RedlineSign label="Sleep Collapse" />
              <RedlineSign label="Attorney Avoidance" />
              <RedlineSign label="Panic around deadlines" />
              <RedlineSign label="Repeated Paralysis" />
            </div>
          </div>
          <div className="md:w-2/3 bg-white rounded-xl p-6 shadow-sm border border-red-100">
            <h4 className="text-lg font-bold text-legal-navy mb-4 flex items-center">
              <Zap size={20} className="mr-2 text-amber-500" />
              Re-Alignment Protocol
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AlignmentMove title="48h Low-Exposure Reset" desc="Reduce legal information intake for 48 hours to clear cognitive fog." />
              <AlignmentMove title="One-Task-Only Mode" desc="Focus exclusively on the single most critical legal task. Ignore all else." />
              <AlignmentMove title="Outsource Sorting" desc="Delegate document organization to reduce administrative overwhelm." />
              <AlignmentMove title="Mock Prep Session" desc="Verbalize your position to regain confidence and coherence." />
            </div>
            <button className="mt-6 w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
              Initiate Emergency Re-Alignment
            </button>
          </div>
        </div>
      </section>

      {/* Safety Note */}
      <div className="text-center py-10 opacity-40">
        <p className="text-[10px] max-w-2xl mx-auto">
          This framework is for managing stress, clarity, and performance in legal conditions. For medical symptoms related to stress or burnout, consult a healthcare provider. For legal strategy, follow the advice of your counsel.
        </p>
      </div>
    </div>
  );
}

function OverviewCard({ label, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="glass-panel p-4 flex flex-col items-center text-center">
      <div className={`p-2 rounded-lg ${bgColor} ${color} mb-2`}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-legal-navy mt-1">{value}</p>
    </div>
  );
}

function CheckInSlider({ label, value, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-sm font-bold text-legal-navy">{value}/5</span>
      </div>
      <input 
        type="range" 
        min="1" 
        max="5" 
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-legal-navy"
      />
      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

function PerformanceRow({ milestone, requirement, state, move, status }: any) {
  const statusColors = {
    warning: 'text-amber-600 bg-amber-50',
    danger: 'text-red-600 bg-red-50',
    success: 'text-emerald-600 bg-emerald-50'
  };
  
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="py-4 font-bold text-legal-navy">{milestone}</td>
      <td className="py-4 text-slate-500">{requirement}</td>
      <td className="py-4">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${statusColors[status as keyof typeof statusColors]}`}>
          {state}
        </span>
      </td>
      <td className="py-4 text-xs font-medium text-slate-700">{move}</td>
    </tr>
  );
}

function TriggerTag({ label, intensity }: any) {
  const intensityColors = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200'
  };
  
  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${intensityColors[intensity as keyof typeof intensityColors]}`}>
      {label}
    </span>
  );
}

function RedlineSign({ label }: any) {
  return (
    <div className="flex items-center space-x-2 text-red-700">
      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function AlignmentMove({ title, desc }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-legal-navy/20 transition-all cursor-default">
      <h5 className="text-sm font-bold text-legal-navy mb-1">{title}</h5>
      <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
