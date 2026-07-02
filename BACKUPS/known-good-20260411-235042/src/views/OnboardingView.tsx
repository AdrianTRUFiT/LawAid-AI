import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Users,
  UserPlus,
  Clock,
  FileText,
  Brain,
  Scale,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useProject, Party, Witness, TimelineEvent, EvidenceEntry, Recollection } from '../context/ProjectContext';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function OnboardingView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { activeProject, updateIntake } = useProject();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState(activeProject?.intake || {
    matterInfo: { jurisdiction: '', matterType: '', description: '', courtLocation: '' },
    parties: [] as Party[],
    witnesses: [] as Witness[],
    timeline: [] as TimelineEvent[],
    evidence: [] as EvidenceEntry[],
    recollections: [] as Recollection[],
    isComplete: false
  });

  React.useEffect(() => {
    if (activeProject?.intake) {
      setFormData(activeProject.intake);
    }
  }, [activeProject?.id]);

  const handleSaveAndClose = () => {
    updateIntake(activeProject.id, formData);
    onNavigate('projects');
  };

  if (!activeProject) return null;

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as Step);
      updateIntake(activeProject.id, formData);
    } else {
      const finalData = { ...formData, isComplete: true };
      setFormData(finalData);
      updateIntake(activeProject.id, finalData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const updateMatterInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      matterInfo: { ...prev.matterInfo, [field]: value }
    }));
  };

  const addParty = () => {
    const newParty: Party = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      role: '',
      relationship: '',
      credibility: 'Neutral',
      notes: ''
    };
    setFormData((prev) => ({ ...prev, parties: [...prev.parties, newParty] }));
  };

  const updateParty = (id: string, field: keyof Party, value: string) => {
    setFormData((prev) => ({
      ...prev,
      parties: prev.parties.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    }));
  };

  const removeParty = (id: string) => {
    setFormData((prev) => ({ ...prev, parties: prev.parties.filter((p) => p.id !== id) }));
  };

  const addWitness = () => {
    const newWitness: Witness = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'Fact',
      history: '',
      notes: ''
    };
    setFormData((prev) => ({ ...prev, witnesses: [...prev.witnesses, newWitness] }));
  };

  const updateWitness = (id: string, field: keyof Witness, value: string) => {
    setFormData((prev) => ({
      ...prev,
      witnesses: prev.witnesses.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    }));
  };

  const removeWitness = (id: string) => {
    setFormData((prev) => ({ ...prev, witnesses: prev.witnesses.filter((w) => w.id !== id) }));
  };

  const addTimelineEvent = () => {
    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      date: '',
      description: '',
      sourceIds: [],
      certainty: 'Medium'
    };
    setFormData((prev) => ({ ...prev, timeline: [...prev.timeline, newEvent] }));
  };

  const updateTimelineEvent = (id: string, field: keyof TimelineEvent, value: any) => {
    setFormData((prev) => ({
      ...prev,
      timeline: prev.timeline.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    }));
  };

  const removeTimelineEvent = (id: string) => {
    setFormData((prev) => ({ ...prev, timeline: prev.timeline.filter((e) => e.id !== id) }));
  };

  const addEvidence = () => {
    const newEvidence: EvidenceEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      date: '',
      producer: '',
      circumstances: '',
      tags: []
    };
    setFormData((prev) => ({ ...prev, evidence: [...prev.evidence, newEvidence] }));
  };

  const updateEvidence = (id: string, field: keyof EvidenceEntry, value: any) => {
    setFormData((prev) => ({
      ...prev,
      evidence: prev.evidence.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    }));
  };

  const removeEvidence = (id: string) => {
    setFormData((prev) => ({ ...prev, evidence: prev.evidence.filter((e) => e.id !== id) }));
  };

  const addRecollection = () => {
    const newRecollection: Recollection = {
      id: Math.random().toString(36).substr(2, 9),
      narrative: '',
      uncertainties: '',
      date: new Date().toISOString().split('T')[0]
    };
    setFormData((prev) => ({ ...prev, recollections: [...prev.recollections, newRecollection] }));
  };

  const updateRecollection = (id: string, field: keyof Recollection, value: string) => {
    setFormData((prev) => ({
      ...prev,
      recollections: prev.recollections.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    }));
  };

  const removeRecollection = (id: string) => {
    setFormData((prev) => ({ ...prev, recollections: prev.recollections.filter((r) => r.id !== id) }));
  };

  const steps = [
    { id: 1, title: 'Matter Intake', icon: Scale },
    { id: 2, title: 'Parties', icon: Users },
    { id: 3, title: 'Key People', icon: UserPlus },
    { id: 4, title: 'Timeline', icon: Clock },
    { id: 5, title: 'Evidence Log', icon: FileText },
    { id: 6, title: 'Recollection', icon: Brain },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-legal-navy">Case Intake &amp; Onboarding</h1>
        <p className="text-slate-500 mt-2">Building the structured record foundation for LawAidAI intelligence.</p>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center space-y-2 flex-1 relative ${step.id !== 6 ? 'after:content-[""] after:h-[2px] after:w-full after:bg-slate-100 after:absolute after:top-5 after:left-1/2 after:-z-10' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep === step.id
                    ? 'bg-legal-navy text-white scale-110 shadow-lg'
                    : currentStep > step.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white border-2 border-slate-100 text-slate-300'
                }`}
              >
                {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep === step.id ? 'text-legal-navy' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-panel p-8 min-h-[500px] flex flex-col"
            >
              {currentStep === 1 && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-slate-100 text-legal-navy rounded-xl">
                      <Scale size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Step 1: Matter Intake</h2>
                      <p className="text-sm text-slate-500">Establish jurisdiction and matter type to gate AI logic.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jurisdiction</label>
                      <input
                        type="text"
                        value={formData.matterInfo.jurisdiction}
                        onChange={(e) => updateMatterInfo('jurisdiction', e.target.value)}
                        placeholder="e.g. California Superior Court"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-legal-navy/10 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Court Location / Address</label>
                      <input
                        type="text"
                        value={formData.matterInfo.courtLocation || ''}
                        onChange={(e) => updateMatterInfo('courtLocation', e.target.value)}
                        placeholder="e.g. 111 N Hill St, Los Angeles, CA"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-legal-navy/10 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Matter Type</label>
                      <select
                        value={formData.matterInfo.matterType}
                        onChange={(e) => updateMatterInfo('matterType', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-legal-navy/10 outline-none"
                      >
                        <option value="">Select Matter Type</option>
                        <option value="Family Law - Custody">Family Law - Custody</option>
                        <option value="Family Law - Divorce">Family Law - Divorce</option>
                        <option value="Personal Injury">Personal Injury</option>
                        <option value="Civil Litigation">Civil Litigation</option>
                        <option value="Employment Law">Employment Law</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Matter Description</label>
                    <textarea
                      value={formData.matterInfo.description}
                      onChange={(e) => updateMatterInfo('description', e.target.value)}
                      placeholder="Briefly describe the core of this matter..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-legal-navy/10 outline-none h-32 resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-slate-100 text-legal-navy rounded-xl">
                        <Users size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Step 2: Parties</h2>
                        <p className="text-sm text-slate-500">Capture names, roles, and relationships.</p>
                      </div>
                    </div>
                    <button
                      onClick={addParty}
                      className="flex items-center space-x-2 text-xs font-bold text-legal-navy hover:bg-slate-50 px-3 py-2 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Party</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.parties.map((party) => (
                      <div key={party.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative group">
                        <button
                          onClick={() => removeParty(party.id)}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="Full Name"
                            value={party.name}
                            onChange={(e) => updateParty(party.id, 'name', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                          <input
                            placeholder="Role (e.g. Petitioner, Respondent)"
                            value={party.role}
                            onChange={(e) => updateParty(party.id, 'role', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="Relationship to Client"
                            value={party.relationship}
                            onChange={(e) => updateParty(party.id, 'relationship', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                          <select
                            value={party.credibility}
                            onChange={(e) => updateParty(party.id, 'credibility', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="High">High Credibility</option>
                            <option value="Neutral">Neutral Credibility</option>
                            <option value="Low">Low Credibility</option>
                            <option value="Hostile">Hostile</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {formData.parties.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-sm text-slate-400">No parties added yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-slate-100 text-legal-navy rounded-xl">
                        <UserPlus size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Step 3: Key People</h2>
                        <p className="text-sm text-slate-500">Witnesses, Judges, Opposing Counsel, Experts.</p>
                      </div>
                    </div>
                    <button
                      onClick={addWitness}
                      className="flex items-center space-x-2 text-xs font-bold text-legal-navy hover:bg-slate-50 px-3 py-2 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Person</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.witnesses.map((witness) => (
                      <div key={witness.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative">
                        <button
                          onClick={() => removeWitness(witness.id)}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="Full Name"
                            value={witness.name}
                            onChange={(e) => updateWitness(witness.id, 'name', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                          <select
                            value={witness.type}
                            onChange={(e) => updateWitness(witness.id, 'type', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="Fact Witness">Fact Witness</option>
                            <option value="Expert Witness">Expert Witness</option>
                            <option value="Judge">Judge</option>
                            <option value="Opposing Counsel">Opposing Counsel</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <textarea
                          placeholder="Known history, style, or specific positions..."
                          value={witness.history}
                          onChange={(e) => updateWitness(witness.id, 'history', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm h-20 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-slate-100 text-legal-navy rounded-xl">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Step 4: Timeline & Facts</h2>
                        <p className="text-sm text-slate-500">The spine of the case. Identify gaps and certainty.</p>
                      </div>
                    </div>
                    <button
                      onClick={addTimelineEvent}
                      className="flex items-center space-x-2 text-xs font-bold text-legal-navy hover:bg-slate-50 px-3 py-2 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Event</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.timeline.map((event) => (
                      <div key={event.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative">
                        <button
                          onClick={() => removeTimelineEvent(event.id)}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="date"
                            value={event.date}
                            onChange={(e) => updateTimelineEvent(event.id, 'date', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                          <select
                            value={event.certainty}
                            onChange={(e) => updateTimelineEvent(event.id, 'certainty', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="High">High Certainty</option>
                            <option value="Medium">Medium Certainty</option>
                            <option value="Low">Low Certainty / Gap</option>
                          </select>
                        </div>
                        <textarea
                          placeholder="Describe the fact or event..."
                          value={event.description}
                          onChange={(e) => updateTimelineEvent(event.id, 'description', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm h-20 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-slate-100 text-legal-navy rounded-xl">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Step 5: Evidence Log</h2>
                        <p className="text-sm text-slate-500">Chain of custody and production tracking.</p>
                      </div>
                    </div>
                    <button
                      onClick={addEvidence}
                      className="flex items-center space-x-2 text-xs font-bold text-legal-navy hover:bg-slate-50 px-3 py-2 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Evidence</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.evidence.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative">
                        <button
                          onClick={() => removeEvidence(item.id)}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="Document Title"
                            value={item.title}
                            onChange={(e) => updateEvidence(item.id, 'title', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                          <input
                            placeholder="Produced By (Who?)"
                            value={item.producer}
                            onChange={(e) => updateEvidence(item.id, 'producer', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                        <textarea
                          placeholder="Circumstances of production / Chain of custody notes..."
                          value={item.circumstances}
                          onChange={(e) => updateEvidence(item.id, 'circumstances', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm h-20 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-slate-100 text-legal-navy rounded-xl">
                        <Brain size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Step 6: Recollection & Memory</h2>
                        <p className="text-sm text-slate-500">The client's narrative and uncertainties.</p>
                      </div>
                    </div>
                    <button
                      onClick={addRecollection}
                      className="flex items-center space-x-2 text-xs font-bold text-legal-navy hover:bg-slate-50 px-3 py-2 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Narrative</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.recollections.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative">
                        <button
                          onClick={() => removeRecollection(item.id)}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <textarea
                          placeholder="Your narrative / What you remember..."
                          value={item.narrative}
                          onChange={(e) => updateRecollection(item.id, 'narrative', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm h-32 resize-none"
                        />
                        <textarea
                          placeholder="What are you uncertain about? (Gaps for AI to flag)"
                          value={item.uncertainties}
                          onChange={(e) => updateRecollection(item.id, 'uncertainties', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm h-20 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 px-6 py-3 text-slate-500 font-bold hover:text-legal-navy transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSaveAndClose}
                  className="flex items-center space-x-2 px-6 py-3 text-slate-400 font-bold hover:text-legal-navy transition-all border border-transparent hover:border-slate-200 rounded-xl"
                >
                  <span>Save &amp; Close</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-legal-navy text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                >
                  <span>{currentStep === 6 ? 'Complete Intake' : 'Continue'}</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center text-lg font-bold text-amber-800">
              <AlertCircle size={20} className="mr-2 text-amber-600" />
              Intake Doctrine
            </h3>
            <div className="space-y-5 text-sm leading-relaxed">
              <div>
                <span className="mb-1 block font-bold text-amber-700">👉 The Record is the Product</span>
                <p className="text-slate-600">
                  We do not just search documents. We build a structured truth foundation.
                </p>
              </div>
              <div>
                <span className="mb-1 block font-bold text-amber-700">👉 Context Gating</span>
                <p className="text-slate-600">
                  Your matter type determines the intelligence layers applied downstream.
                </p>
              </div>
              <div>
                <span className="mb-1 block font-bold text-amber-700">👉 Gap Awareness</span>
                <p className="text-slate-600">
                  Identifying what you do not know is as important as what you do know.
                </p>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Intake Status</h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${currentStep >= step.id ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-xs ${currentStep === step.id ? 'font-bold text-legal-navy' : 'text-slate-500'}`}>{step.title}</span>
                  </div>
                  {currentStep > step.id && <CheckCircle2 size={12} className="text-emerald-500" />}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}