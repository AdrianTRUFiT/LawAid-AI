import { LawAidAIWorkspace, OutputValidationResult } from './casePathContracts';

export function validateOutputReadiness(workspace: LawAidAIWorkspace): OutputValidationResult {
  const mismatches: string[] = [];
  const requiredReview: string[] = [];
  const boundary = [
    'AI output is draft/support material until validated.',
    'LawAidAI does not provide legal advice.',
    'Export requires source-grounded user-confirmed facts.',
    'Court-facing material must remain marked for user/attorney review.'
  ];

  if (workspace.documents.length === 0) mismatches.push('NO_SOURCE_DOCUMENTS');
  if (workspace.timelineEntries.length === 0) mismatches.push('NO_TIMELINE_ENTRIES');
  if (workspace.issueBuckets.length === 0) mismatches.push('NO_ISSUE_BUCKETS');
  if (workspace.userConfirmedFacts.length === 0) requiredReview.push('USER_CONFIRMED_FACTS_REQUIRED');
  if (workspace.confidence < 0.8) requiredReview.push('CONFIDENCE_REVIEW_REQUIRED');

  const exportAllowed =
    mismatches.length === 0 &&
    requiredReview.length === 0 &&
    workspace.paid &&
    workspace.trialState === 'paid_unlocked';

  return {
    status: exportAllowed ? 'export_ready' : mismatches.length > 0 ? 'export_blocked' : 'needs_review',
    exportAllowed,
    confidence: workspace.confidence,
    mismatches,
    requiredReview,
    boundary
  };
}
