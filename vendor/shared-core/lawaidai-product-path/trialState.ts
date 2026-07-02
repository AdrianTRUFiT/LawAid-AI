import { LawAidAIWorkspace, TrialState } from './casePathContracts';

export function deriveTrialState(startedAtISO: string, paid: boolean, now = new Date()): TrialState {
  if (paid) return 'paid_unlocked';

  const startedAt = new Date(startedAtISO);
  const ageMs = now.getTime() - startedAt.getTime();
  const day = Math.floor(ageMs / (24 * 60 * 60 * 1000));

  if (day >= 7) return 'trial_locked';
  if (day >= 5) return 'trial_expiring';
  return 'trial_active';
}

export function canUseTrialFeature(workspace: LawAidAIWorkspace, feature: 'preview' | 'edit' | 'export' | 'advanced_output') {
  if (workspace.paid || workspace.trialState === 'paid_unlocked') return true;

  if (workspace.trialState === 'trial_locked') {
    return false;
  }

  if (feature === 'export' || feature === 'advanced_output') {
    return false;
  }

  return true;
}

export function shouldShowConversion(workspace: LawAidAIWorkspace) {
  if (workspace.paid) return false;

  return (
    workspace.currentStep === 'preview_ready' ||
    workspace.currentStep === 'paid_unlock_required' ||
    workspace.outputStatus === 'validated_preview'
  );
}
