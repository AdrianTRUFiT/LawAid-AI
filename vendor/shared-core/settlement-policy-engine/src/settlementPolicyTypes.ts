import type { NormalizedPaymentRailArtifact } from "../../payment-rail-abstraction-layer/src/index.js";

export type SettlementDecision =
  | "RETAIN_ASSET"
  | "CONVERT_TO_FIAT"
  | "CONVERT_TO_STABLECOIN"
  | "HOLD_FOR_REVIEW"
  | "REFUSE";

export interface SettlementPolicyInput {
  subjectId: string;
  paymentRail: NormalizedPaymentRailArtifact;
  preferredStablecoin?: "USDC" | "USDT";
  forceFiatThreshold?: number;
  restrictedRegions?: string[];
  allowedRetainAssets?: string[];
  reviewAboveAmount?: number;
}

export interface SettlementPolicyArtifact {
  settlementPolicyId: string;
  subjectId: string;
  sourcePaymentRailId: string;
  receivedAsset: string;
  receivedAmount: number;
  receivedCurrency: string;
  settlementDecision: SettlementDecision;
  settlementAsset: string | null;
  reviewRequired: boolean;
  policyReason: string;
  createdAt: string;
}

export interface SettlementPolicyRefusal {
  refusalCode:
    | "MISSING_PAYMENT_RAIL"
    | "SUBJECT_MISMATCH"
    | "REGION_RESTRICTED"
    | "UNSUPPORTED_ASSET";
  refusalReason: string;
}

export interface SettlementPolicyResult {
  ok: boolean;
  artifact: SettlementPolicyArtifact | null;
  refusal: SettlementPolicyRefusal | null;
}