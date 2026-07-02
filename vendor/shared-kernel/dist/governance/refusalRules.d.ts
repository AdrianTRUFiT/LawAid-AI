export declare const REFUSAL_REASONS: readonly ["missing_fields", "illegal_route", "unknown_domain", "unknown_artifact_type", "authority_violation"];
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
export declare function accept(): AcceptanceResult;
export declare function refuse(reason: RefusalReason, details: string): RefusalResult;
