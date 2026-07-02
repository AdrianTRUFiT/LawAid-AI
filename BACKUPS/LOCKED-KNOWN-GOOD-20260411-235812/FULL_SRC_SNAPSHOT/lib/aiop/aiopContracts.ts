export type AiopStage =
  | "entry"
  | "situation_snapshot"
  | "reality_check"
  | "context_capture"
  | "identity_posture"
  | "system_preview"
  | "commitment_readiness"
  | "handoff";

export type PressureCategory =
  | "deadline"
  | "communication"
  | "money"
  | "missing_access"
  | "uncertainty"
  | "evidence"
  | "other";

export type PostureState =
  | "solo"
  | "represented"
  | "transitioning"
  | "uncertain";

export type ReadinessState =
  | "early"
  | "clarifying"
  | "ready_to_continue"
  | "needs_review";

export type PaymentReadiness =
  | "not_applicable"
  | "preview_only"
  | "save_gate_ready";

export interface CapturedSignal {
  signalId: string;
  source: string;
  signalCategory: string;
  contextExcerpt?: string;
  urgencyMarkers?: string[];
  routeabilityIndicators?: string[];
  earlyRiskMarkers?: string[];
  continuityData?: Record<string, unknown>;
}

export interface AiopQuestionOption {
  value: string;
  label: string;
}

export interface AiopQuestion {
  id: string;
  stage: Exclude<AiopStage, "handoff">;
  prompt: string;
  helperText?: string;
  type: "single_select" | "multi_select" | "text";
  options?: AiopQuestionOption[];
  required?: boolean;
}

export interface AiopResponse {
  questionId: string;
  value: string | string[];
}

export interface AiopInsight {
  pressureCenter: string;
  hiddenDependency: string;
  firstProtectiveMove: string;
  atRiskArea: string;
  suggestedNextModule: string;
  trustSummary: string;
}

export interface AiopInterpretation {
  pressureCategory: PressureCategory;
  posture: PostureState;
  urgency: "low" | "medium" | "high";
  riskSignals: string[];
  readinessState: ReadinessState;
  paymentReadiness: PaymentReadiness;
  routingDecision: string;
  preferences: string[];
  initializationHints: string[];
  insight: AiopInsight;
}

export interface VerifiedOpportunity {
  opportunityId: string;
  sessionId: string;
  createdAt: string;
  capturedSignalId: string;
  identity: {
    name?: string;
    email?: string;
  };
  context: {
    pressureCategory: PressureCategory;
    primaryConcern: string;
    notes?: string;
  };
  posture: PostureState;
  urgency: "low" | "medium" | "high";
  riskSignals: string[];
  preferences: string[];
  routingDecision: string;
  readinessState: ReadinessState;
  paymentReadiness: PaymentReadiness;
  connections: {
    source: string;
    signalCategory: string;
  };
  initializationHints: string[];
}

export interface AiopSessionState {
  sessionId: string;
  capturedSignal: CapturedSignal;
  startedAt: string;
  currentStage: AiopStage;
  responses: Record<string, AiopResponse>;
  interpretation?: AiopInterpretation;
  verifiedOpportunity?: VerifiedOpportunity;
  completedStages: AiopStage[];
}

export interface AiopAnalyticsEvent {
  sessionId: string;
  type:
    | "session_started"
    | "stage_viewed"
    | "response_captured"
    | "insight_rendered"
    | "verified_opportunity_emitted";
  stage?: AiopStage;
  questionId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
