export type TrialState =
  | 'trial_active'
  | 'trial_expiring'
  | 'trial_locked'
  | 'paid_unlocked';

export type CasePathStep =
  | 'entry'
  | 'case_created'
  | 'documents_uploaded'
  | 'timeline_generated'
  | 'issues_classified'
  | 'evidence_organized'
  | 'preview_ready'
  | 'paid_unlock_required'
  | 'export_ready'
  | 'packet_exported';

export type CaseAction =
  | 'CREATE_CASE'
  | 'UPLOAD_DOCUMENT'
  | 'GENERATE_TIMELINE'
  | 'CLASSIFY_ISSUES'
  | 'ORGANIZE_EVIDENCE'
  | 'PREVIEW_OUTPUT'
  | 'EXPORT_PACKET'
  | 'CONTINUE_WORKSPACE'
  | 'UNLOCK_PAID';

export type OutputStatus =
  | 'draft_only'
  | 'needs_review'
  | 'validated_preview'
  | 'export_blocked'
  | 'export_ready';

export type LawAidAIWorkspace = {
  workspaceId: string;
  userId: string;
  caseType: string;
  currentStep: CasePathStep;
  trialState: TrialState;
  paid: boolean;
  documents: string[];
  timelineEntries: string[];
  issueBuckets: string[];
  evidenceItems: string[];
  communications: string[];
  expenses: string[];
  deadlines: string[];
  tasks: string[];
  notes: string[];
  userConfirmedFacts: string[];
  confidence: number;
  outputStatus: OutputStatus;
  lastValidStateId?: string;
};

export type RefereeDecision = {
  allowed: boolean;
  action: CaseAction;
  currentStep: CasePathStep;
  nextStep?: CasePathStep;
  reason: string;
  missing: string[];
  blocked: string[];
};

export type SavedStateSnapshot = {
  snapshotId: string;
  workspaceId: string;
  createdAt: string;
  currentStep: CasePathStep;
  trialState: TrialState;
  paid: boolean;
  confidence: number;
  outputStatus: OutputStatus;
  workspace: LawAidAIWorkspace;
};

export type OutputValidationResult = {
  status: OutputStatus;
  exportAllowed: boolean;
  confidence: number;
  mismatches: string[];
  requiredReview: string[];
  boundary: string[];
};

export type RevenueEvent = {
  eventId: string;
  createdAt: string;
  source: string;
  campaign?: string;
  keyword?: string;
  adSpend: number;
  visitorCount: number;
  trialStarts: number;
  paidConversions: number;
  refunds: number;
  aiCost: number;
  hostingCost: number;
  grossRevenue: number;
};

export type RevenueSnapshot = {
  status: 'PROFITABLE' | 'UNPROVEN' | 'UNPROFITABLE';
  roas: number;
  cacPaidOnly: number;
  netProfit: number;
  rule: '$1_SPEND_MUST_RETURN_$2_PLUS_REVENUE';
};
