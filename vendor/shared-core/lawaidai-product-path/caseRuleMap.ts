import { CaseAction, CasePathStep, LawAidAIWorkspace } from './casePathContracts';

export const CASE_PATH_ORDER: CasePathStep[] = [
  'entry',
  'case_created',
  'documents_uploaded',
  'timeline_generated',
  'issues_classified',
  'evidence_organized',
  'preview_ready',
  'paid_unlock_required',
  'export_ready',
  'packet_exported'
];

export const REQUIRED_BY_ACTION: Record<CaseAction, (keyof LawAidAIWorkspace)[]> = {
  CREATE_CASE: ['userId', 'caseType'],
  UPLOAD_DOCUMENT: ['workspaceId'],
  GENERATE_TIMELINE: ['documents'],
  CLASSIFY_ISSUES: ['timelineEntries'],
  ORGANIZE_EVIDENCE: ['documents', 'issueBuckets'],
  PREVIEW_OUTPUT: ['timelineEntries', 'issueBuckets'],
  EXPORT_PACKET: ['timelineEntries', 'issueBuckets', 'evidenceItems', 'userConfirmedFacts'],
  CONTINUE_WORKSPACE: ['workspaceId'],
  UNLOCK_PAID: ['workspaceId']
};

export const NEXT_STEP_BY_ACTION: Record<CaseAction, CasePathStep> = {
  CREATE_CASE: 'case_created',
  UPLOAD_DOCUMENT: 'documents_uploaded',
  GENERATE_TIMELINE: 'timeline_generated',
  CLASSIFY_ISSUES: 'issues_classified',
  ORGANIZE_EVIDENCE: 'evidence_organized',
  PREVIEW_OUTPUT: 'preview_ready',
  EXPORT_PACKET: 'packet_exported',
  CONTINUE_WORKSPACE: 'case_created',
  UNLOCK_PAID: 'export_ready'
};

export function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  return value !== null && value !== undefined;
}
