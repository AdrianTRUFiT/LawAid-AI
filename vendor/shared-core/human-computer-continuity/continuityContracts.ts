export type ContinuityCondition =
  | 'attention_captured'
  | 'intent_structured'
  | 'clarity_trusted'
  | 'authorship_verified'
  | 'authority_granted';

export type RateContinuityStage =
  | 'market_entry'
  | 'recruit'
  | 'acquire'
  | 'authorship_verification'
  | 'authority_boundary'
  | 'consequence_ready';

export type ContinuityGateStatus =
  | 'open'
  | 'blocked'
  | 'needs_clarity'
  | 'needs_authorship'
  | 'needs_authority';

export type HumanComputerEntrySignal = {
  signalId: string;
  userId?: string;
  deviceId?: string;
  dashboardSurface: string;
  source: string;
  capturedAt: string;
  attentionCaptured: boolean;
  statedIntent?: string;
  structuredIntent?: string;
  clarityStatement?: string;
  soulMarkId?: string;
  authorshipVerified: boolean;
  humanApproved: boolean;
  artifactType?: string;
};

export type ContinuityConditionResult = {
  condition: ContinuityCondition;
  passed: boolean;
  stage: RateContinuityStage;
  reason: string;
};

export type ContinuityDecision = {
  status: ContinuityGateStatus;
  movementAllowed: boolean;
  currentStage: RateContinuityStage;
  nextStage?: RateContinuityStage;
  passedConditions: ContinuityCondition[];
  failedConditions: ContinuityCondition[];
  reasons: string[];
  doctrine: string;
};
