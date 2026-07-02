import { LawAidAIWorkspace } from './casePathContracts';
import { TrialBannerViewModel } from './shellViewContracts';

export function buildTrialBannerViewModel(workspace: LawAidAIWorkspace): TrialBannerViewModel {
  if (workspace.trialState === 'paid_unlocked') {
    return {
      show: true,
      state: workspace.trialState,
      message: 'Paid unlock active. Export remains governed by readiness and proof.',
      severity: 'success'
    };
  }

  if (workspace.trialState === 'trial_locked') {
    return {
      show: true,
      state: workspace.trialState,
      message: 'Trial locked. Your workspace is preserved. Upgrade is required to continue editing or export.',
      severity: 'locked'
    };
  }

  if (workspace.trialState === 'trial_expiring') {
    return {
      show: true,
      state: workspace.trialState,
      message: 'Trial expiring. Upgrade to preserve full workflow access and unlock final outputs.',
      severity: 'warning'
    };
  }

  return {
    show: true,
    state: workspace.trialState,
    message: 'Trial active. Build your workspace and preview your organized case path.',
    severity: 'info'
  };
}
