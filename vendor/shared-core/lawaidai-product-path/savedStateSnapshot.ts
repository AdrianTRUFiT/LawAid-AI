import crypto from 'crypto';
import { LawAidAIWorkspace, SavedStateSnapshot } from './casePathContracts';

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function createSavedStateSnapshot(workspace: LawAidAIWorkspace): SavedStateSnapshot {
  const createdAt = new Date().toISOString();
  const snapshotId = 'LWISNAP-' + sha(workspace.workspaceId + createdAt + JSON.stringify(workspace)).slice(0, 12);

  return {
    snapshotId,
    workspaceId: workspace.workspaceId,
    createdAt,
    currentStep: workspace.currentStep,
    trialState: workspace.trialState,
    paid: workspace.paid,
    confidence: workspace.confidence,
    outputStatus: workspace.outputStatus,
    workspace: JSON.parse(JSON.stringify(workspace))
  };
}

export function restoreLastValidState(snapshot: SavedStateSnapshot): LawAidAIWorkspace {
  return JSON.parse(JSON.stringify(snapshot.workspace));
}
