export type ActivatedTransactionState = {
  artifactType: 'ActivatedTransactionState';
  transactionId: string;
  workspaceId: string;
  userId: string;
  productCode: 'LAWAIDAI_CASE_EXPORT_UNLOCK';
  status: 'activated' | 'failed' | 'pending' | 'stale' | 'refused';
  amount: number;
  currency: string;
  activatedAt: string;
  expiresAt?: string;
  fundTrackerSeal: string;
  source: 'FundTrackerAI' | 'TEST_STUB';
};

export type PaidUnlockDecision = {
  allowed: boolean;
  status:
    | 'PAID_UNLOCK_ALLOWED'
    | 'PAID_UNLOCK_REFUSED'
    | 'PAID_UNLOCK_STALE'
    | 'PAID_UNLOCK_WRONG_WORKSPACE'
    | 'PAID_UNLOCK_MISSING_ACTIVATION';
  reason: string;
  blocked: string[];
};

export type ExportUnlockProof = {
  proofType: 'LAWAIDAI_EXPORT_UNLOCK_PROOF';
  proofId: string;
  workspaceId: string;
  userId: string;
  transactionId: string;
  createdAt: string;
  activatedTransactionState: ActivatedTransactionState;
  boundary: string[];
};

export type TrialToPaidTransition = {
  transitionType: 'TRIAL_TO_PAID_TRANSITION';
  workspaceId: string;
  userId: string;
  fromTrialState: 'trial_active' | 'trial_expiring' | 'trial_locked';
  toTrialState: 'paid_unlocked';
  createdAt: string;
  exportUnlockProofId: string;
};
