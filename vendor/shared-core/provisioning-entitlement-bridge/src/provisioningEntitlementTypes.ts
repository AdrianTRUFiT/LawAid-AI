import type { SubscriptionStateArtifact } from "../../subscription-state-bridge/src/index.js";

export type EntitlementState =
  | "entitled"
  | "held"
  | "suspended"
  | "revoked"
  | "review_required";

export type ProvisioningAction =
  | "ACTIVATE"
  | "HOLD"
  | "SUSPEND"
  | "REVOKE"
  | "REVIEW";

export interface ProvisioningEntitlementInput {
  subjectId: string;
  subscriptionState: SubscriptionStateArtifact;
  packageId?: string | null;
  featureSet?: string[];
}

export interface ProvisioningEntitlementArtifact {
  entitlementId: string;
  subjectId: string;
  customerId: string;
  subscriptionId: string | null;
  packageId: string | null;
  featureSet: string[];
  entitlementState: EntitlementState;
  provisioningAction: ProvisioningAction;
  activationEligible: boolean;
  continuityEligible: boolean;
  sourceSubscriptionStateId: string;
  reason: string;
  createdAt: string;
}

export interface ProvisioningEntitlementRefusal {
  refusalCode:
    | "MISSING_SUBSCRIPTION_STATE"
    | "SUBJECT_MISMATCH"
    | "UNSUPPORTED_SUBSCRIPTION_STATE";
  refusalReason: string;
}

export interface ProvisioningEntitlementResult {
  ok: boolean;
  artifact: ProvisioningEntitlementArtifact | null;
  refusal: ProvisioningEntitlementRefusal | null;
}