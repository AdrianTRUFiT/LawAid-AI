import { LawAidAIWorkspace } from './casePathContracts';

export type WorkspaceCompletionArea =
  | 'overview'
  | 'documents'
  | 'timeline'
  | 'issues'
  | 'evidence'
  | 'communications'
  | 'expenses'
  | 'deadlines'
  | 'tasks'
  | 'notes'
  | 'confirmed_facts';

export type MissingItem = {
  area: WorkspaceCompletionArea;
  code: string;
  label: string;
  requiredForPreview: boolean;
  requiredForExport: boolean;
};

export type WorkspaceCompletionScore = {
  status: 'incomplete' | 'preview_ready' | 'export_candidate' | 'export_ready';
  score: number;
  completedAreas: WorkspaceCompletionArea[];
  missingItems: MissingItem[];
  previewReady: boolean;
  exportCandidate: boolean;
};

function present(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'boolean') return true;
  return value !== null && value !== undefined;
}

export function getMissingItems(workspace: LawAidAIWorkspace): MissingItem[] {
  const missing: MissingItem[] = [];

  if (!present(workspace.caseType)) {
    missing.push({
      area: 'overview',
      code: 'CASE_TYPE_REQUIRED',
      label: 'Case type is required.',
      requiredForPreview: true,
      requiredForExport: true
    });
  }

  if (!present(workspace.documents)) {
    missing.push({
      area: 'documents',
      code: 'DOCUMENTS_REQUIRED',
      label: 'At least one source document is required.',
      requiredForPreview: true,
      requiredForExport: true
    });
  }

  if (!present(workspace.timelineEntries)) {
    missing.push({
      area: 'timeline',
      code: 'TIMELINE_REQUIRED',
      label: 'Timeline entries are required.',
      requiredForPreview: true,
      requiredForExport: true
    });
  }

  if (!present(workspace.issueBuckets)) {
    missing.push({
      area: 'issues',
      code: 'ISSUE_BUCKETS_REQUIRED',
      label: 'Issue buckets are required.',
      requiredForPreview: true,
      requiredForExport: true
    });
  }

  if (!present(workspace.evidenceItems)) {
    missing.push({
      area: 'evidence',
      code: 'EVIDENCE_ITEMS_REQUIRED',
      label: 'Evidence items are required for export readiness.',
      requiredForPreview: false,
      requiredForExport: true
    });
  }

  if (!present(workspace.userConfirmedFacts)) {
    missing.push({
      area: 'confirmed_facts',
      code: 'USER_CONFIRMED_FACTS_REQUIRED',
      label: 'User-confirmed facts are required before export.',
      requiredForPreview: false,
      requiredForExport: true
    });
  }

  return missing;
}

export function scoreWorkspaceCompletion(workspace: LawAidAIWorkspace): WorkspaceCompletionScore {
  const checks: Array<[WorkspaceCompletionArea, boolean]> = [
    ['overview', present(workspace.caseType)],
    ['documents', present(workspace.documents)],
    ['timeline', present(workspace.timelineEntries)],
    ['issues', present(workspace.issueBuckets)],
    ['evidence', present(workspace.evidenceItems)],
    ['communications', present(workspace.communications)],
    ['expenses', present(workspace.expenses)],
    ['deadlines', present(workspace.deadlines)],
    ['tasks', present(workspace.tasks)],
    ['notes', present(workspace.notes)],
    ['confirmed_facts', present(workspace.userConfirmedFacts)]
  ];

  const completedAreas = checks.filter(([, ok]) => ok).map(([area]) => area);
  const score = Math.round((completedAreas.length / checks.length) * 100);
  const missingItems = getMissingItems(workspace);

  const previewReady = !missingItems.some(item => item.requiredForPreview);
  const exportCandidate = !missingItems.some(item => item.requiredForExport);

  let status: WorkspaceCompletionScore['status'] = 'incomplete';

  if (previewReady) status = 'preview_ready';
  if (exportCandidate) status = 'export_candidate';
  if (exportCandidate && workspace.outputStatus === 'export_ready' && workspace.paid) {
    status = 'export_ready';
  }

  return {
    status,
    score,
    completedAreas,
    missingItems,
    previewReady,
    exportCandidate
  };
}
