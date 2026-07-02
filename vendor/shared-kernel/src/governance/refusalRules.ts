export const REFUSAL_REASONS = [
  "missing_fields",
  "illegal_route",
  "unknown_domain",
  "unknown_artifact_type",
  "authority_violation"
] as const;

export type RefusalReason = typeof REFUSAL_REASONS[number];

export interface RefusalResult {
  accepted: false;
  reason: RefusalReason;
  details: string;
}

export interface AcceptanceResult {
  accepted: true;
}

export type GovernanceDecision = RefusalResult | AcceptanceResult;

export function accept(): AcceptanceResult {
  return { accepted: true };
}

export function refuse(
  reason: RefusalReason,
  details: string
): RefusalResult {
  return {
    accepted: false,
    reason,
    details
  };
}
