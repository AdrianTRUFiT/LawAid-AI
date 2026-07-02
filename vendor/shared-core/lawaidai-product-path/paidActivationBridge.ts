import crypto from 'crypto';
import {
  ActivatedTransactionState,
  ExportUnlockProof,
  PaidUnlockDecision,
  TrialToPaidTransition
} from './paidActivationContracts';
import { LawAidAIWorkspace } from './casePathContracts';

function sha(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function isExpired(activation: ActivatedTransactionState, now = new Date()) {
  if (!activation.expiresAt) return false;
  return new Date(activation.expiresAt).getTime() < now.getTime();
}

export function evaluatePaidUnlock(
  workspace: LawAidAIWorkspace,
  activation?: ActivatedTransactionState,
  now = new Date()
): PaidUnlockDecision {
  if (!activation) {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_MISSING_ACTIVATION',
      reason: 'Activated Transaction State is required before paid export unlock.',
      blocked: ['ACTIVATED_TRANSACTION_STATE_REQUIRED']
    };
  }

  if (activation.artifactType !== 'ActivatedTransactionState') {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_REFUSED',
      reason: 'Invalid activation artifact type.',
      blocked: ['INVALID_ACTIVATION_ARTIFACT']
    };
  }

  if (activation.status !== 'activated') {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_REFUSED',
      reason: 'Transaction is not activated.',
      blocked: ['TRANSACTION_NOT_ACTIVATED', activation.status.toUpperCase()]
    };
  }

  if (activation.workspaceId !== workspace.workspaceId) {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_WRONG_WORKSPACE',
      reason: 'Activated Transaction State does not belong to this workspace.',
      blocked: ['WORKSPACE_MISMATCH']
    };
  }

  if (activation.userId !== workspace.userId) {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_REFUSED',
      reason: 'Activated Transaction State does not belong to this user.',
      blocked: ['USER_MISMATCH']
    };
  }

  if (activation.productCode !== 'LAWAIDAI_CASE_EXPORT_UNLOCK') {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_REFUSED',
      reason: 'Activated Transaction State is not for LawAidAI export unlock.',
      blocked: ['WRONG_PRODUCT_CODE']
    };
  }

  if (!activation.fundTrackerSeal || activation.fundTrackerSeal.trim().length < 8) {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_REFUSED',
      reason: 'FundTrackerAI seal is missing or invalid.',
      blocked: ['FUNDTRACKER_SEAL_REQUIRED']
    };
  }

  if (isExpired(activation, now)) {
    return {
      allowed: false,
      status: 'PAID_UNLOCK_STALE',
      reason: 'Activated Transaction State is stale.',
      blocked: ['ACTIVATION_STALE']
    };
  }

  return {
    allowed: true,
    status: 'PAID_UNLOCK_ALLOWED',
    reason: 'Activated Transaction State permits paid export unlock.',
    blocked: []
  };
}

export function createExportUnlockProof(
  workspace: LawAidAIWorkspace,
  activation: ActivatedTransactionState
): ExportUnlockProof {
  const decision = evaluatePaidUnlock(workspace, activation);

  if (!decision.allowed) {
    throw new Error('EXPORT_UNLOCK_REFUSED: ' + decision.blocked.join(','));
  }

  const createdAt = new Date().toISOString();
  const proofId = 'LWIUNLOCK-' + sha(workspace.workspaceId + activation.transactionId + createdAt).slice(0, 12);

  return {
    proofType: 'LAWAIDAI_EXPORT_UNLOCK_PROOF',
    proofId,
    workspaceId: workspace.workspaceId,
    userId: workspace.userId,
    transactionId: activation.transactionId,
    createdAt,
    activatedTransactionState: activation,
    boundary: [
      'Payment transport is not authority.',
      'FundTrackerAI-style Activated Transaction State is required.',
      'Export unlock follows verified transaction truth.',
      'LawAidAI may render export only after paid unlock proof exists.'
    ]
  };
}

export function applyPaidUnlock(
  workspace: LawAidAIWorkspace,
  proof: ExportUnlockProof
): { workspace: LawAidAIWorkspace; transition: TrialToPaidTransition } {
  if (proof.workspaceId !== workspace.workspaceId) {
    throw new Error('TRIAL_TO_PAID_REFUSED: WORKSPACE_MISMATCH');
  }

  const previousTrialState = workspace.trialState;

  if (
    previousTrialState !== 'trial_active' &&
    previousTrialState !== 'trial_expiring' &&
    previousTrialState !== 'trial_locked'
  ) {
    throw new Error('TRIAL_TO_PAID_REFUSED: INVALID_FROM_STATE');
  }

  const updated: LawAidAIWorkspace = {
    ...workspace,
    paid: true,
    trialState: 'paid_unlocked'
  };

  return {
    workspace: updated,
    transition: {
      transitionType: 'TRIAL_TO_PAID_TRANSITION',
      workspaceId: workspace.workspaceId,
      userId: workspace.userId,
      fromTrialState: previousTrialState,
      toTrialState: 'paid_unlocked',
      createdAt: new Date().toISOString(),
      exportUnlockProofId: proof.proofId
    }
  };
}
