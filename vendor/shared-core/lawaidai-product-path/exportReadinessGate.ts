import { LawAidAIWorkspace } from './casePathContracts';
import { scoreWorkspaceCompletion, WorkspaceCompletionScore } from './workspaceCompletion';
import { validateOutputReadiness } from './outputValidation';

export type ExportReadinessGate = {
  status: 'blocked' | 'needs_review' | 'ready';
  exportAllowed: boolean;
  reasons: string[];
  completion: WorkspaceCompletionScore;
};

export function evaluateExportReadiness(workspace: LawAidAIWorkspace): ExportReadinessGate {
  const reasons: string[] = [];
  const completion = scoreWorkspaceCompletion(workspace);
  const validation = validateOutputReadiness(workspace);

  if (!workspace.paid) reasons.push('PAID_UNLOCK_REQUIRED');
  if (workspace.trialState !== 'paid_unlocked') reasons.push('PAID_TRIAL_STATE_REQUIRED');
  if (!completion.exportCandidate) {
    reasons.push(...completion.missingItems.filter(i => i.requiredForExport).map(i => i.code));
  }
  if (!validation.exportAllowed) {
    reasons.push(...validation.mismatches);
    reasons.push(...validation.requiredReview);
  }
  if (workspace.confidence < 0.8) reasons.push('CONFIDENCE_BELOW_EXPORT_THRESHOLD');

  const uniqueReasons = Array.from(new Set(reasons));
  const exportAllowed = uniqueReasons.length === 0;

  return {
    status: exportAllowed ? 'ready' : uniqueReasons.includes('USER_CONFIRMED_FACTS_REQUIRED') || uniqueReasons.includes('CONFIDENCE_REVIEW_REQUIRED') ? 'needs_review' : 'blocked',
    exportAllowed,
    reasons: uniqueReasons,
    completion
  };
}
