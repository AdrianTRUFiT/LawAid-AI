export type UnifiedRefusalResult =
  | "ALLOW"
  | "HOLD_PROTECTED"
  | "REFUSE_RECOVERABLE"
  | "REFUSE_HARD";

export interface UnifiedRefusalInput {
  allowed?: boolean;
  hold?: boolean;
  recoverable?: boolean;
  reasonCode?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface RefusalDecision {
  result: UnifiedRefusalResult;
  reasonCode: string;
  reason: string;
  requiresHumanReview: boolean;
  metadata?: Record<string, unknown>;
}

export type RefusalDecisionState = UnifiedRefusalResult;
