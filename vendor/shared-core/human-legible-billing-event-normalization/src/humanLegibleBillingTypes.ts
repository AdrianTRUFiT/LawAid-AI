import type { BillingTruthArtifact } from "../../billing-truth-normalization-layer/src/index.js";
import type { SubscriptionStateArtifact } from "../../subscription-state-bridge/src/index.js";

export type HumanLegibleBillingEvent =
  | "trial_started"
  | "paid_activated"
  | "grace_entered"
  | "payment_recovered"
  | "past_due_detected"
  | "cancellation_scheduled"
  | "refund_recorded"
  | "review_required";

export type HumanLegibleLifecycleState =
  | "ACTIVE_TRIAL"
  | "ACTIVE_PAID"
  | "GRACE"
  | "PAST_DUE"
  | "CANCELED_PERIOD_END"
  | "ARCHIVED"
  | "PENDING_ACCEPTANCE";

export interface HumanLegibleBillingInput {
  subjectId: string;
  billingTruth: BillingTruthArtifact;
  subscriptionState: SubscriptionStateArtifact;
}

export interface HumanLegibleBillingArtifact {
  normalizedLifecycleEventId: string;
  subjectId: string;
  sourceTruthId: string;
  sourceSubscriptionStateId: string;
  humanLegibleEvent: HumanLegibleBillingEvent;
  resolvedLifecycleState: HumanLegibleLifecycleState;
  reason: string;
  createdAt: string;
}

export interface HumanLegibleBillingRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "UNSUPPORTED_COMBINATION";
  refusalReason: string;
}

export interface HumanLegibleBillingResult {
  ok: boolean;
  artifact: HumanLegibleBillingArtifact | null;
  refusal: HumanLegibleBillingRefusal | null;
}