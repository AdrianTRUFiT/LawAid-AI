import type {
  HumanLegibleBillingArtifact,
  HumanLegibleBillingInput,
  HumanLegibleBillingResult,
} from "./humanLegibleBillingTypes.js";
import { makeHumanLegibleBillingId, nowIso } from "./humanLegibleBillingUtils.js";

export function runHumanLegibleBillingEventNormalization(
  input: HumanLegibleBillingInput,
): HumanLegibleBillingResult {
  if (!input.billingTruth || !input.subscriptionState) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Human-legible billing normalization refused because billing truth or subscription state is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.subscriptionState.subjectId ||
    input.subjectId !== input.billingTruth.customerId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Human-legible billing normalization refused because subject identity does not match governing billing/subscription state.",
      },
    };
  }

  let humanLegibleEvent:
    | "trial_started"
    | "paid_activated"
    | "grace_entered"
    | "payment_recovered"
    | "past_due_detected"
    | "cancellation_scheduled"
    | "refund_recorded"
    | "review_required";

  let resolvedLifecycleState:
    | "ACTIVE_TRIAL"
    | "ACTIVE_PAID"
    | "GRACE"
    | "PAST_DUE"
    | "CANCELED_PERIOD_END"
    | "ARCHIVED"
    | "PENDING_ACCEPTANCE";

  let reason = "";

  if (input.billingTruth.normalizedStatus === "ACTIVE" && input.subscriptionState.subscriptionState === "active") {
    humanLegibleEvent = "paid_activated";
    resolvedLifecycleState = "ACTIVE_PAID";
    reason = "Active billing truth and active subscription state resolved into paid activation.";
  } else if (input.billingTruth.normalizedStatus === "PAST_DUE" && input.subscriptionState.subscriptionState === "past_due") {
    humanLegibleEvent = "past_due_detected";
    resolvedLifecycleState = "PAST_DUE";
    reason = "Past-due billing truth resolved into past-due lifecycle state.";
  } else if (input.billingTruth.normalizedStatus === "PENDING" && input.subscriptionState.subscriptionState === "pending_review") {
    humanLegibleEvent = "review_required";
    resolvedLifecycleState = "PENDING_ACCEPTANCE";
    reason = "Pending billing truth resolved into review-required lifecycle state.";
  } else if (input.billingTruth.normalizedStatus === "CANCELLED" && input.subscriptionState.subscriptionState === "cancelled") {
    humanLegibleEvent = "cancellation_scheduled";
    resolvedLifecycleState = "CANCELED_PERIOD_END";
    reason = "Cancelled billing truth resolved into cancellation-scheduled lifecycle state.";
  } else if (input.billingTruth.normalizedStatus === "REFUNDED" && input.subscriptionState.subscriptionState === "refund_recorded") {
    humanLegibleEvent = "refund_recorded";
    resolvedLifecycleState = "ARCHIVED";
    reason = "Refund-recorded state resolved into archived lifecycle consequence.";
  } else if (input.billingTruth.normalizedStatus === "REFUSED" && input.subscriptionState.subscriptionState === "suspended") {
    humanLegibleEvent = "grace_entered";
    resolvedLifecycleState = "GRACE";
    reason = "Refused financial path resolved into grace-state protection rather than raw rail failure exposure.";
  } else if (input.billingTruth.normalizedStatus === "ACTIVE" && input.subscriptionState.subscriptionState === "past_due") {
    humanLegibleEvent = "payment_recovered";
    resolvedLifecycleState = "ACTIVE_PAID";
    reason = "Recovered active billing truth resolved into active paid lifecycle state.";
  } else {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "UNSUPPORTED_COMBINATION",
        refusalReason: `Human-legible billing normalization refused because billing status '${input.billingTruth.normalizedStatus}' and subscription state '${input.subscriptionState.subscriptionState}' are not supported together.`,
      },
    };
  }

  const artifact: HumanLegibleBillingArtifact = {
    normalizedLifecycleEventId: makeHumanLegibleBillingId(
      input.billingTruth.truthId,
      input.subscriptionState.subscriptionStateId,
    ),
    subjectId: input.subjectId,
    sourceTruthId: input.billingTruth.truthId,
    sourceSubscriptionStateId: input.subscriptionState.subscriptionStateId,
    humanLegibleEvent,
    resolvedLifecycleState,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}