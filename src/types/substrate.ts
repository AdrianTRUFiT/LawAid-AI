export type LawAidViewKey =
  | 'dashboard'
  | 'cases'
  | 'calendar'
  | 'events'
  | 'tasks'
  | 'documents'
  | 'expenses'
  | 'audit_trail'
  | 'activation_queue'
  | 'friction_audit'
  | 'workflow'
  | 'strategic_intake'
  | 'wellness'
  | 'memory_hub'
  | 'settings'
  | 'assistant'
  | 'evidence'
  | 'custody';

export type PerspectiveTag =
  | 'finance'
  | 'communication'
  | 'deadlines'
  | 'housing'
  | 'children'
  | 'insurance'
  | 'medical'
  | 'evidence'
  | 'workflow'
  | 'stability'
  | 'timeline'
  | 'court'
  | 'counsel'
  | 'reputation';

export type PressureDomain =
  | 'shelter_and_home'
  | 'work_and_income'
  | 'insurance_and_coverage'
  | 'money_and_obligations'
  | 'children_and_family'
  | 'medical_and_recovery'
  | 'privacy_identity_reputation'
  | 'cognitive_emotional_stability'
  | 'procedure_and_deadlines'
  | 'communication_continuity';

export type PositionImpact = 'low' | 'medium' | 'high';
export type StabilityImpact = 'low' | 'medium' | 'high';

export type ClarityState = 'clear' | 'partial' | 'unclear';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type WorkflowTaskType =
  | 'review'
  | 'follow_up'
  | 'draft'
  | 'collect'
  | 'prepare'
  | 'verify'
  | 'organize'
  | 'submit'
  | 'calendar'
  | 'unknown';

export type QueryIntentType =
  | 'informational'
  | 'procedural'
  | 'evidentiary'
  | 'timeline'
  | 'packet_building'
  | 'action_taking'
  | 'unknown';

export type ProcessStage =
  | 'confused_starting'
  | 'gathering'
  | 'organizing'
  | 'proving'
  | 'preparing_output'
  | 'sharing_filing'
  | 'unknown';

export interface ViewCapability {
  key: LawAidViewKey;
  label: string;
  perspectiveTags: PerspectiveTag[];
  supportsEvidence: boolean;
  supportsCustody: boolean;
  supportsWorkflow: boolean;
  supportsAssistant: boolean;
}

export interface ManagedIssue {
  id: string;
  matterId: string;
  title: string;
  summary: string;
  pressureDomains: PressureDomain[];
  priority: PriorityLevel;
  clarityState: ClarityState;
  taskType: WorkflowTaskType;
  nextAction: string;
  dueAt: string | null;
  blockedBy: string[];
  positionImpact: PositionImpact;
  stabilityImpact: StabilityImpact;
  downstreamRiskNote: string;
  whyThisMatters: string;
  linkedRecordIds: string[];
  linkedTaskIds: string[];
  linkedEventIds: string[];
  linkedExpenseIds: string[];
  linkedPerspectiveTags: PerspectiveTag[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryContext {
  query: string;
  matterId?: string;
  dateFrom?: string;
  dateTo?: string;
  people?: string[];
  perspectiveHints?: PerspectiveTag[];
  intentHint?: QueryIntentType;
  processStageHint?: ProcessStage;
}

export interface CandidatePerspective {
  view: LawAidViewKey;
  score: number;
  reasons: string[];
}

export interface NarrowedPerspectiveResult {
  query: string;
  intentType: QueryIntentType;
  processStage: ProcessStage;
  candidates: CandidatePerspective[];
  selectedViews: LawAidViewKey[];
  perspectiveTags: PerspectiveTag[];
  explanation: string[];
}
