export interface HilDegradationInput {
  blocked?: boolean;
  hold?: boolean;
  reasonCode?: string;
  metadata?: Record<string, unknown>;
}

export interface HilDegradationResult {
  decision: "ALLOW" | "HOLD" | "BLOCK";
  reasonCode: string;
  requiresHumanReview: boolean;
}
