import type { SettlementPolicyArtifact } from "../../settlement-policy-engine/src/index.js";

export type TreasuryExceptionState =
  | "none"
  | "review_required"
  | "policy_exception";

export interface TreasuryVisibilityInput {
  subjectId: string;
  settlementPolicy: SettlementPolicyArtifact;
  reserveDestination?: string | null;
}

export interface TreasuryVisibilityArtifact {
  treasuryRecordId: string;
  subjectId: string;
  sourceSettlementPolicyId: string;
  receivedAsset: string;
  receivedAmount: number;
  receivedCurrency: string;
  settlementDecision: string;
  settlementAsset: string | null;
  reserveDestination: string | null;
  exceptionState: TreasuryExceptionState;
  visibilityReason: string;
  createdAt: string;
}

export interface TreasuryVisibilityRefusal {
  refusalCode:
    | "MISSING_SETTLEMENT_POLICY"
    | "SUBJECT_MISMATCH"
    | "MALFORMED_SETTLEMENT_POLICY";
  refusalReason: string;
}

export interface TreasuryVisibilityResult {
  ok: boolean;
  artifact: TreasuryVisibilityArtifact | null;
  refusal: TreasuryVisibilityRefusal | null;
}