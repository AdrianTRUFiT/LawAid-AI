export type ScreeningMode = "disabled" | "observe" | "review" | "enforce";

export type ScreeningDecision =
  | "PASS"
  | "REVIEW_REQUIRED"
  | "HOLD"
  | "REFUSE";

export type ScreeningSeverity = "low" | "medium" | "high" | "critical";

export type ScreeningRuleType =
  | "SANCTIONS_MATCH"
  | "KYC_INCOMPLETE"
  | "DUPLICATE_TRANSACTION"
  | "VELOCITY_LIMIT"
  | "AMOUNT_THRESHOLD"
  | "COUNTRY_RESTRICTION"
  | "CONTRADICTORY_METADATA";

export type ScreeningArtifactType =
  | "ScreeningEntryArtifact"
  | "ScreeningRuleHitArtifact"
  | "ScreeningReviewRequiredArtifact"
  | "ScreeningHoldArtifact"
  | "ScreeningRefusalArtifact"
  | "ScreeningClearanceArtifact"
  | "ScreeningSummaryArtifact";

export type ConsequenceClass =
  | "allow_progression"
  | "require_human_review"
  | "hold_progression"
  | "refuse_progression";

export interface RuleHit {
  ruleId: string;
  ruleType: ScreeningRuleType;
  severity: ScreeningSeverity;
  message: string;
  triggered: boolean;
  evidence?: Record<string, unknown>;
}

export interface ScreeningArtifact {
  artifactId: string;
  artifactType: ScreeningArtifactType;
  createdAt: string;
  transactionId: string;
  decision: ScreeningDecision;
  consequenceClass: ConsequenceClass;
  details: Record<string, unknown>;
}

export interface ScreeningResult {
  transactionId: string;
  mode: ScreeningMode;
  decision: ScreeningDecision;
  consequenceClass: ConsequenceClass;
  hits: RuleHit[];
  artifacts: ScreeningArtifact[];
  reviewRequired: boolean;
  blocked: boolean;
  allowed: boolean;
  summary: string;
}

export interface ScreeningReviewPacket {
  transactionId: string;
  decision: ScreeningDecision;
  summary: string;
  hitCount: number;
  hits: RuleHit[];
  reviewerNotesAllowed: boolean;
  blockedUntilResolution: boolean;
}
