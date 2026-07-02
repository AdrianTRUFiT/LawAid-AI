import type {
  RuleHit,
  ScreeningDecision,
  ScreeningMode,
  ScreeningResult,
} from "./screeningTypes";

export interface ScreeningParty {
  id: string;
  name?: string;
  country?: string;
  kycVerified: boolean;
  sanctionsMatched?: boolean;
}

export interface ScreeningInput {
  transactionId: string;
  transactionType: string;
  amount: number;
  currency: string;
  sender: ScreeningParty;
  recipient: ScreeningParty;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  priorTransactionIds?: string[];
  recentVelocityCount?: number;
}

export interface ScreeningPolicyRule {
  id: string;
  enabled: boolean;
  threshold?: number;
  allowedCountries?: string[];
  blockedCountries?: string[];
  severityOnTrigger?: "low" | "medium" | "high" | "critical";
}

export interface ScreeningPolicy {
  policyId: string;
  mode: ScreeningMode;
  rules: {
    sanctions: ScreeningPolicyRule;
    kyc: ScreeningPolicyRule;
    duplicate: ScreeningPolicyRule;
    velocity: ScreeningPolicyRule;
    amountThreshold: ScreeningPolicyRule;
    countryRestriction: ScreeningPolicyRule;
    contradictoryMetadata: ScreeningPolicyRule;
  };
}

export interface ScreeningEngineInput {
  input: ScreeningInput;
  policy: ScreeningPolicy;
}

export interface ScreeningEngineOutput extends ScreeningResult {}

export interface ScreeningDecisionResolution {
  decision: ScreeningDecision;
  consequenceClass:
    | "allow_progression"
    | "require_human_review"
    | "hold_progression"
    | "refuse_progression";
  summary: string;
}

export interface RuleEvaluator {
  (input: ScreeningInput, policy: ScreeningPolicy): RuleHit | null;
}
