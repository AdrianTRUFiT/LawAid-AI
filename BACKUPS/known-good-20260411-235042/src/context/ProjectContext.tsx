import React, { createContext, useContext, useState, ReactNode } from 'react';

export type RepresentationState = 'represented' | 'transitioning' | 'pro_se';

export interface Party {
  id: string;
  name: string;
  role: string;
  relationship: string;
  credibility: string;
  notes: string;
}

export interface Witness {
  id: string;
  name: string;
  type: string;
  history: string;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  description: string;
  sourceIds: string[];
  certainty: 'High' | 'Medium' | 'Low';
}

export interface EvidenceEntry {
  id: string;
  title: string;
  date: string;
  producer: string;
  circumstances: string;
  tags: string[];
}

export interface Recollection {
  id: string;
  narrative: string;
  uncertainties: string;
  date: string;
}

export interface CaseIntake {
  matterInfo: {
    jurisdiction: string;
    matterType: string;
    description: string;
    courtLocation?: string;
  };
  parties: Party[];
  witnesses: Witness[];
  timeline: TimelineEvent[];
  evidence: EvidenceEntry[];
  recollections: Recollection[];
  isComplete: boolean;
}

export interface Case {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'archived';
  representationState: RepresentationState;
  createdAt: string;
  intake?: CaseIntake;
}

export interface Record {
  id: string;
  projectId: string;
  title: string;
  type: 'event' | 'task' | 'document' | 'expense';
  status: string;
  date: string;
  description?: string;
  verified: boolean;
  category?: string;
  amount?: number;
  priority?: 'Urgent' | 'High' | 'Medium' | 'Low';
  size?: string;
}

export interface Signal {
  id: string;
  projectId: string;
  type:
    | 'Billing Irregularity'
    | 'Communication Gap'
    | 'Timeline Drift'
    | 'Promise vs Action Mismatch'
    | 'Missing Documentation';
  description: string;
  supportingEvidenceIds: string[];
  confidence: 'High' | 'Medium' | 'Low';
  recommendedAction: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'dismissed';
}

export interface FileRecord {
  id: string;
  projectId: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'stored' | 'analyzing' | 'analyzed' | 'promoted';
  analysis?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface WellnessCheckIn {
  date: string;
  stress: number;
  clarity: number;
  sleep: number;
  reactivity: number;
  recovery: number;
  confidence: number;
  notes?: string;
}

export interface WellnessState {
  readinessScore: number;
  stressLoad: number;
  decisionClarity: number;
  burnoutRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  alignmentStatus: 'Aligned' | 'Strained' | 'Misaligned';
  checkIns: WellnessCheckIn[];
}

interface ProjectContextType {
  activeProject: Case | null;
  projects: Case[];
  setActiveProject: (project: Case | null) => void;
  createProject: (project?: Partial<Case>) => Case;
  deleteProject: (id: string) => void;
  records: Record[];
  setRecords: React.Dispatch<React.SetStateAction<Record[]>>;
  signals: Signal[];
  setSignals: React.Dispatch<React.SetStateAction<Signal[]>>;
  files: FileRecord[];
  setFiles: React.Dispatch<React.SetStateAction<FileRecord[]>>;
  updateRecord: (id: string, updates: Partial<Record>) => void;
  addRecord: (record: Omit<Record, 'id'>) => void;
  deleteRecords: (ids: string[]) => void;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  setRepresentationState: (state: RepresentationState) => void;
  addFile: (file: Omit<FileRecord, 'id' | 'uploadedAt' | 'status'>) => void;
  updateFile: (id: string, updates: Partial<FileRecord>) => void;
  updateIntake: (projectId: string, updates: Partial<CaseIntake>) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  exportAllData: () => void;
  clearAllData: () => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  wellness: WellnessState;
  addWellnessCheckIn: (checkIn: Omit<WellnessCheckIn, 'date'>) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const MOCK_PROJECTS: Case[] = [
  {
    id: '1',
    name: 'Family Matter - Custody',
    type: 'Family Law',
    status: 'active',
    representationState: 'represented',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Personal Injury Claim',
    type: 'Civil Litigation',
    status: 'active',
    representationState: 'pro_se',
    createdAt: '2024-02-20T14:30:00Z',
  }
];

const INITIAL_RECORDS: Record[] = [
  { id: 'e1', projectId: '1', title: 'Attorney Phone Call', type: 'event', status: 'verified', date: '2024-03-20', verified: true, description: 'Discussed custody schedule proposal. Attorney promised draft by Friday.', category: 'Communication' },
  { id: 'e2', projectId: '1', title: 'Document Filing', type: 'event', status: 'verified', date: '2024-03-18', verified: true, description: 'Financial disclosure statement filed with the court.', category: 'Procedural' },
  { id: 'e3', projectId: '1', title: 'Consultation with Counsel', type: 'event', status: 'verified', date: '2024-03-12', verified: true, description: 'In-person meeting to review case strategy.', category: 'Meeting' },
  { id: 't1', projectId: '1', title: 'Follow up on Custody Draft', type: 'task', status: 'open', date: '2024-03-21', verified: false, priority: 'Urgent', description: 'Attorney promised draft by Friday. Verify receipt.' },
  { id: 't2', projectId: '1', title: 'Upload Medical Records', type: 'task', status: 'open', date: '2024-03-25', verified: false, priority: 'High', description: 'Required for upcoming mediation session.' },
  { id: 'd1', projectId: '1', title: 'Custody_Draft_V1.pdf', type: 'document', status: 'verified', date: '2024-03-20', verified: true, category: 'Correspondence', size: '1.2 MB' },
  { id: 'd2', projectId: '1', title: 'Financial_Disclosure_Final.pdf', type: 'document', status: 'verified', date: '2024-03-18', verified: true, category: 'Filing', size: '4.5 MB' },
  { id: 'd3', projectId: '1', title: 'Bank_Statement_Feb24.pdf', type: 'document', status: 'verified', date: '2024-03-15', verified: true, category: 'Financial', size: '850 KB' },
  { id: 'd4', projectId: '1', title: 'Mediation_Agenda.docx', type: 'document', status: 'pending', date: '2024-03-12', verified: false, category: 'Meeting', size: '45 KB' },
  { id: 'x1', projectId: '1', title: 'Retainer Replenishment', type: 'expense', status: 'verified', date: '2024-03-15', verified: true, amount: 2500 },
  { id: 'x2', projectId: '1', title: 'Court Filing Fee', type: 'expense', status: 'verified', date: '2024-03-10', verified: true, amount: 350 },
  { id: 'x3', projectId: '1', title: 'Legal Consultation (1.5h)', type: 'expense', status: 'pending', date: '2024-03-05', verified: false, amount: 450 },
];

const INITIAL_SIGNALS: Signal[] = [
  {
    id: 's1',
    projectId: '1',
    type: 'Billing Irregularity',
    description: '$450 billed on March 5 for Legal Consultation. No associated communication or documented work found in records for this date.',
    supportingEvidenceIds: ['x3'],
    confidence: 'Medium',
    recommendedAction: 'Request a breakdown of time entries for March 5 to verify the consultation details.',
    timestamp: '2024-03-21T10:00:00Z',
    status: 'active'
  },
  {
    id: 's2',
    projectId: '1',
    type: 'Promise vs Action Mismatch',
    description: 'Attorney indicated filing within 7 days during phone call on March 20. No filing or update recorded as of today.',
    supportingEvidenceIds: ['e1'],
    confidence: 'High',
    recommendedAction: 'Request status confirmation and filing details regarding the custody draft mentioned on March 20.',
    timestamp: '2024-03-21T11:30:00Z',
    status: 'active'
  }
];

function createBlankCase(overrides: Partial<Case> = {}): Case {
  return {
    id: Math.random().toString(36).slice(2, 11),
    name: 'New Case',
    type: 'Uncategorized',
    status: 'active',
    representationState: 'pro_se',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const EMPTY_INTAKE: CaseIntake = {
  matterInfo: { jurisdiction: '', matterType: '', description: '' },
  parties: [],
  witnesses: [],
  timeline: [],
  evidence: [],
  recollections: [],
  isComplete: false
};

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProject] = useState<Case | null>(MOCK_PROJECTS[0]);
  const [projects, setProjects] = useState<Case[]>(MOCK_PROJECTS);
  const [records, setRecords] = useState<Record[]>(INITIAL_RECORDS);
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [user, setUser] = useState<UserProfile>({
    name: 'Adrian Legal',
    email: 'adrianlegalstuff@gmail.com'
  });
  const [wellness, setWellness] = useState<WellnessState>({
    readinessScore: 78,
    stressLoad: 62,
    decisionClarity: 85,
    burnoutRisk: 'Medium',
    alignmentStatus: 'Aligned',
    checkIns: [
      { date: '2024-03-20', stress: 3, clarity: 4, sleep: 4, reactivity: 2, recovery: 3, confidence: 4 },
      { date: '2024-03-19', stress: 4, clarity: 3, sleep: 3, reactivity: 3, recovery: 2, confidence: 3 }
    ]
  });
  const [isLoading] = useState(false);

  const createProject = (project: Partial<Case> = {}) => {
    const newProject = createBlankCase(project);

    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);

    return newProject;
  };

  const addWellnessCheckIn = (checkIn: Omit<WellnessCheckIn, 'date'>) => {
    const newCheckIn: WellnessCheckIn = {
      ...checkIn,
      date: new Date().toISOString().split('T')[0]
    };

    setWellness(prev => {
      const updatedCheckIns = [newCheckIn, ...prev.checkIns].slice(0, 30);

      const avgStress = updatedCheckIns.reduce((sum, c) => sum + c.stress, 0) / updatedCheckIns.length;
      const avgClarity = updatedCheckIns.reduce((sum, c) => sum + c.clarity, 0) / updatedCheckIns.length;
      const avgSleep = updatedCheckIns.reduce((sum, c) => sum + c.sleep, 0) / updatedCheckIns.length;

      const readinessScore = Math.round((avgClarity * 10 + avgSleep * 10 + (6 - avgStress) * 10) / 3) * 3.33;
      const stressLoad = Math.round(avgStress * 20);
      const decisionClarity = Math.round(avgClarity * 20);

      let burnoutRisk: WellnessState['burnoutRisk'] = 'Low';
      if (avgStress > 4) burnoutRisk = 'Critical';
      else if (avgStress > 3) burnoutRisk = 'High';
      else if (avgStress > 2) burnoutRisk = 'Medium';

      let alignmentStatus: WellnessState['alignmentStatus'] = 'Aligned';
      if (burnoutRisk === 'Critical' || burnoutRisk === 'High') alignmentStatus = 'Misaligned';
      else if (burnoutRisk === 'Medium') alignmentStatus = 'Strained';

      return {
        ...prev,
        readinessScore: Math.min(100, Math.max(0, Math.round(readinessScore))),
        stressLoad: Math.min(100, Math.max(0, stressLoad)),
        decisionClarity: Math.min(100, Math.max(0, decisionClarity)),
        burnoutRisk,
        alignmentStatus,
        checkIns: updatedCheckIns
      };
    });
  };

  const updateRecord = (id: string, updates: Partial<Record>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addRecord = (record: Omit<Record, 'id'>) => {
    const newRecord: Record = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
    };
    setRecords(prev => [...prev, newRecord]);
  };

  const deleteRecords = (ids: string[]) => {
    setRecords(prev => prev.filter(r => !ids.includes(r.id)));
  };

  const updateSignal = (id: string, updates: Partial<Signal>) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const setRepresentationState = (state: RepresentationState) => {
    if (!activeProject || activeProject.representationState === state) return;

    const prevState = activeProject.representationState;
    const newState = state;

    setActiveProject(prev => prev ? { ...prev, representationState: state } : null);
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, representationState: state } : p));

    addRecord({
      projectId: activeProject.id,
      title: `Representation Transition: ${prevState.replace('_', ' ')} → ${newState.replace('_', ' ')}`,
      type: 'event',
      status: 'verified',
      date: new Date().toISOString().split('T')[0],
      description: `User updated representation status from ${prevState} to ${newState}. All subsequent analysis will be contextualized for this state.`,
      verified: true,
      category: 'Procedural'
    });
  };

  const addFile = (file: Omit<FileRecord, 'id' | 'uploadedAt' | 'status'>) => {
    const newFile: FileRecord = {
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString(),
      status: 'stored'
    };
    setFiles(prev => [newFile, ...prev]);
  };

  const updateFile = (id: string, updates: Partial<FileRecord>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (activeProject?.id === id) {
      setActiveProject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteProject = (id: string) => {
    setProjects(prevProjects => {
      const filteredProjects = prevProjects.filter(project => project.id !== id);

      setRecords(prevRecords => prevRecords.filter(record => record.projectId !== id));
      setSignals(prevSignals => prevSignals.filter(signal => signal.projectId !== id));
      setFiles(prevFiles => prevFiles.filter(file => file.projectId !== id));

      if (filteredProjects.length === 0) {
        const fallbackProject = createBlankCase({ intake: EMPTY_INTAKE });
        setActiveProject(fallbackProject);
        return [fallbackProject];
      }

      setActiveProject(currentActive => {
        if (currentActive?.id !== id) return currentActive;
        return filteredProjects[0];
      });

      return filteredProjects;
    });
  };

  const updateIntake = (projectId: string, updates: Partial<CaseIntake>) => {
    setActiveProject(prev => {
      if (!prev || prev.id !== projectId) return prev;
      return {
        ...prev,
        intake: {
          ...(prev.intake || EMPTY_INTAKE),
          ...updates
        }
      };
    });

    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      intake: {
        ...(p.intake || EMPTY_INTAKE),
        ...updates
      }
    } : p));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const exportAllData = () => {
    const data = {
      projects,
      records,
      signals,
      files,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawaid_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    const fallbackProject = createBlankCase({ intake: EMPTY_INTAKE });

    setProjects([fallbackProject]);
    setActiveProject(fallbackProject);
    setRecords([]);
    setSignals([]);
    setFiles([]);
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        projects,
        setActiveProject,
        createProject,
        deleteProject,
        records,
        setRecords,
        signals,
        setSignals,
        files,
        setFiles,
        updateRecord,
        addRecord,
        deleteRecords,
        updateSignal,
        setRepresentationState,
        addFile,
        updateFile,
        updateIntake,
        updateCase,
        exportAllData,
        clearAllData,
        user,
        updateUser,
        wellness,
        addWellnessCheckIn,
        isLoading
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}