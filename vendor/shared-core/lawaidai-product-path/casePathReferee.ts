import { CaseAction, LawAidAIWorkspace, RefereeDecision } from './casePathContracts';
import { NEXT_STEP_BY_ACTION, REQUIRED_BY_ACTION, hasValue } from './caseRuleMap';

export function evaluateCasePathAction(
  workspace: LawAidAIWorkspace,
  action: CaseAction
): RefereeDecision {
  const missing = REQUIRED_BY_ACTION[action]
    .filter(field => !hasValue(workspace[field]))
    .map(field => String(field));

  const blocked: string[] = [];

  if (action === 'EXPORT_PACKET' && !workspace.paid) {
    blocked.push('PAID_UNLOCK_REQUIRED');
  }

  if (action === 'EXPORT_PACKET' && workspace.outputStatus !== 'export_ready') {
    blocked.push('OUTPUT_NOT_EXPORT_READY');
  }

  if (action === 'EXPORT_PACKET' && workspace.confidence < 0.8) {
    blocked.push('CONFIDENCE_BELOW_EXPORT_THRESHOLD');
  }

  if (workspace.trialState === 'trial_locked' && !workspace.paid && action !== 'UNLOCK_PAID') {
    blocked.push('TRIAL_LOCKED_UPGRADE_REQUIRED');
  }

  if (action === 'PREVIEW_OUTPUT' && workspace.documents.length === 0) {
    blocked.push('DOCUMENTS_REQUIRED_FOR_PREVIEW');
  }

  const allowed = missing.length === 0 && blocked.length === 0;

  return {
    allowed,
    action,
    currentStep: workspace.currentStep,
    nextStep: allowed ? NEXT_STEP_BY_ACTION[action] : undefined,
    reason: allowed ? 'ACTION_ALLOWED_BY_CASE_PATH_REFEREE' : 'ACTION_BLOCKED_BY_CASE_PATH_REFEREE',
    missing,
    blocked
  };
}
