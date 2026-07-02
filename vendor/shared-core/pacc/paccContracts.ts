export type PaccState =
  | 'ALLOW'
  | 'NUDGE'
  | 'PAUSE'
  | 'REVIEW'
  | 'LOCK';

export type PaccRiskLevel =
  | 'NONE'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'VERIFIED_ERROR';

export type PaccSignal = {
  signalId: string;
  source: string;
  actorType: 'USER' | 'PARENT' | 'SYSTEM' | 'AUTOMATION' | 'UNKNOWN';
  automationName: string;
  actionRequested: string;
  reversible: boolean;
  consequenceBearing: boolean;
  userCustodyPresent: boolean;
  parentCustodyRequired?: boolean;
  parentCustodyPresent?: boolean;
  evidenceCount: number;
  driftDetected?: boolean;
  missingProof?: boolean;
  stageSkipping?: boolean;
  abnormalPattern?: boolean;
  verifiedError?: boolean;
  notes?: string[];
};

export type PaccDecision = {
  decisionId: string;
  state: PaccState;
  riskLevel: PaccRiskLevel;
  allowed: boolean;
  consequenceAllowed: boolean;
  reason: string;
  requiredNextStep: string;
  createdAt: string;
  signal: PaccSignal;
};
