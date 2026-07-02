import type {
  ClarityState,
  ManagedIssue,
  PositionImpact,
  PressureDomain,
  PriorityLevel,
  StabilityImpact,
  WorkflowTaskType,
} from './substrate';

export interface IssueDraftInput {
  matterId: string;
  title: string;
  summary: string;
  pressureDomains?: PressureDomain[];
  priority?: PriorityLevel;
  clarityState?: ClarityState;
  taskType?: WorkflowTaskType;
  nextAction?: string;
  dueAt?: string | null;
  blockedBy?: string[];
  positionImpact?: PositionImpact;
  stabilityImpact?: StabilityImpact;
  downstreamRiskNote?: string;
  whyThisMatters?: string;
  linkedRecordIds?: string[];
  linkedTaskIds?: string[];
  linkedEventIds?: string[];
  linkedExpenseIds?: string[];
}

export interface IssueFactoryResult {
  issue: ManagedIssue;
  reasons: string[];
}
