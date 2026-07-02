import { LawAidAIWorkspace } from './casePathContracts';
import { ActivatedTransactionState } from './paidActivationContracts';
import { WorkspaceViewModel } from './shellViewContracts';
import { scoreWorkspaceCompletion } from './workspaceCompletion';
import { evaluateExportReadiness } from './exportReadinessGate';
import { evaluatePaidUnlock } from './paidActivationBridge';
import { HumanComputerEntrySignal, buildDeviceDashboardContinuityViewModel } from '../human-computer-continuity';

export function deriveShellSurfaceState(
  workspace: LawAidAIWorkspace,
  entrySignal: HumanComputerEntrySignal,
  activation?: ActivatedTransactionState
): WorkspaceViewModel['shellState'] {
  const continuity = buildDeviceDashboardContinuityViewModel(entrySignal);

  if (!continuity.movementAllowed) {
    if (continuity.status === 'needs_clarity') return 'needs_clarity';
    if (continuity.status === 'needs_authorship') return 'needs_authorship';
    if (continuity.status === 'needs_authority') return 'needs_authority';
    return 'entry_blocked';
  }

  if (workspace.trialState === 'trial_locked' && !workspace.paid) return 'trial_locked';

  const exportReadiness = evaluateExportReadiness(workspace);
  const paidUnlock = evaluatePaidUnlock(workspace, activation);

  if (workspace.paid && workspace.trialState === 'paid_unlocked' && paidUnlock.allowed && exportReadiness.exportAllowed) {
    return 'export_ready';
  }

  if (workspace.paid && workspace.trialState === 'paid_unlocked') return 'paid_unlocked';

  if (!exportReadiness.exportAllowed || !paidUnlock.allowed) return 'export_locked';

  return 'workspace_active';
}

export function buildWorkspaceViewModel(
  workspace: LawAidAIWorkspace,
  entrySignal: HumanComputerEntrySignal,
  activation?: ActivatedTransactionState
): WorkspaceViewModel {
  const completion = scoreWorkspaceCompletion(workspace);
  const continuity = buildDeviceDashboardContinuityViewModel(entrySignal);
  const shellState = deriveShellSurfaceState(workspace, entrySignal, activation);

  return {
    workspaceId: workspace.workspaceId,
    caseType: workspace.caseType,
    currentStep: workspace.currentStep,
    shellState,
    completionScore: completion.score,
    previewReady: completion.previewReady,
    exportCandidate: completion.exportCandidate,
    paid: workspace.paid,
    trialState: workspace.trialState,
    outputStatus: workspace.outputStatus,
    missingItems: completion.missingItems.map(item => item.code),
    continuityStatus: continuity.status,
    movementAllowed: continuity.movementAllowed,
    visibleMessage: continuity.visibleMessage
  };
}
