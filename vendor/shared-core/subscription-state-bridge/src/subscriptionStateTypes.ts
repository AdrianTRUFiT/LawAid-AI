import type { BillingTruthArtifact } from "../../billing-truth-normalization-layer/src/index.js";

export type SubscriptionState =
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled"
  | "refund_recorded"
  | "pending_review";

export type ProvisioningPosture =
  | "ALLOW"
  | "HOLD"
  | "BLOCK"
  | "CANCEL"
  | "REVIEW";

export interface SubscriptionStateBridgeInput {
  subjectId: string;
  billingTruth: BillingTruthArtifact;
}

export interface SubscriptionStateArtifact {
  subscriptionStateId: string;
  subjectId: string;
  customerId: string;
  subscriptionId: string | null;
  subscriptionState: SubscriptionState;
  provisioningPosture: ProvisioningPosture;
  continuityEligible: boolean;
  sourceTruthId: string;
  reason: string;
  createdAt: string;
}

export interface SubscriptionStateBridgeRefusal {
  refusalCode:
    | "MISSING_BILLING_TRUTH"
    | "SUBJECT_MISMATCH"
    | "UNSUPPORTED_STATUS";
  refusalReason: string;
}

export interface SubscriptionStateBridgeResult {
  ok: boolean;
  artifact: SubscriptionStateArtifact | null;
  refusal: SubscriptionStateBridgeRefusal | null;
}