import type {
  SubscriptionStateArtifact,
  SubscriptionStateBridgeInput,
  SubscriptionStateBridgeResult,
} from "./subscriptionStateTypes.js";
import { makeSubscriptionStateId, nowIso } from "./subscriptionStateUtils.js";

export function runSubscriptionStateBridge(
  input: SubscriptionStateBridgeInput,
): SubscriptionStateBridgeResult {
  if (!input.billingTruth) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_BILLING_TRUTH",
        refusalReason: "Subscription state bridge refused because billing truth is missing.",
      },
    };
  }

  if (input.subjectId !== input.billingTruth.customerId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Subscription state bridge refused because subjectId does not match billing truth customerId.",
      },
    };
  }

  let subscriptionState:
    | "active"
    | "past_due"
    | "suspended"
    | "cancelled"
    | "refund_recorded"
    | "pending_review";

  let provisioningPosture:
    | "ALLOW"
    | "HOLD"
    | "BLOCK"
    | "CANCEL"
    | "REVIEW";

  let continuityEligible = false;
  let reason = "";

  switch (input.billingTruth.normalizedStatus) {
    case "ACTIVE":
      subscriptionState = "active";
      provisioningPosture = "ALLOW";
      continuityEligible = true;
      reason = "Active billing truth bridged into active subscription state.";
      break;

    case "PAST_DUE":
      subscriptionState = "past_due";
      provisioningPosture = "HOLD";
      continuityEligible = false;
      reason = "Past-due billing truth bridged into held subscription state.";
      break;

    case "PENDING":
      subscriptionState = "pending_review";
      provisioningPosture = "REVIEW";
      continuityEligible = false;
      reason = "Pending billing truth bridged into review-required subscription state.";
      break;

    case "CANCELLED":
      subscriptionState = "cancelled";
      provisioningPosture = "CANCEL";
      continuityEligible = false;
      reason = "Cancelled billing truth bridged into cancelled subscription state.";
      break;

    case "REFUNDED":
      subscriptionState = "refund_recorded";
      provisioningPosture = "BLOCK";
      continuityEligible = false;
      reason = "Refunded billing truth bridged into refund-recorded subscription state.";
      break;

    case "REFUSED":
      subscriptionState = "suspended";
      provisioningPosture = "BLOCK";
      continuityEligible = false;
      reason = "Refused billing truth bridged into suspended subscription state.";
      break;

    default:
      return {
        ok: false,
        artifact: null,
        refusal: {
          refusalCode: "UNSUPPORTED_STATUS",
          refusalReason: `Subscription state bridge refused because normalized status '${input.billingTruth.normalizedStatus}' is unsupported.`,
        },
      };
  }

  const artifact: SubscriptionStateArtifact = {
    subscriptionStateId: makeSubscriptionStateId(input.billingTruth.truthId),
    subjectId: input.subjectId,
    customerId: input.billingTruth.customerId,
    subscriptionId: input.billingTruth.subscriptionId,
    subscriptionState,
    provisioningPosture,
    continuityEligible,
    sourceTruthId: input.billingTruth.truthId,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}