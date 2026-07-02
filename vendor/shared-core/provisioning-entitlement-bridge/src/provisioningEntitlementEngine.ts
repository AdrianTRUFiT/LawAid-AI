import type {
  ProvisioningEntitlementArtifact,
  ProvisioningEntitlementInput,
  ProvisioningEntitlementResult,
} from "./provisioningEntitlementTypes.js";
import { makeEntitlementId, nowIso } from "./provisioningEntitlementUtils.js";

export function runProvisioningEntitlementBridge(
  input: ProvisioningEntitlementInput,
): ProvisioningEntitlementResult {
  if (!input.subscriptionState) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_SUBSCRIPTION_STATE",
        refusalReason: "Provisioning entitlement bridge refused because subscription state is missing.",
      },
    };
  }

  if (input.subjectId !== input.subscriptionState.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Provisioning entitlement bridge refused because subjectId does not match subscription state subjectId.",
      },
    };
  }

  let entitlementState:
    | "entitled"
    | "held"
    | "suspended"
    | "revoked"
    | "review_required";

  let provisioningAction:
    | "ACTIVATE"
    | "HOLD"
    | "SUSPEND"
    | "REVOKE"
    | "REVIEW";

  let activationEligible = false;
  let continuityEligible = false;
  let reason = "";

  switch (input.subscriptionState.subscriptionState) {
    case "active":
      entitlementState = "entitled";
      provisioningAction = "ACTIVATE";
      activationEligible = true;
      continuityEligible = input.subscriptionState.continuityEligible;
      reason = "Active subscription state bridged into entitled provisioning posture.";
      break;

    case "past_due":
      entitlementState = "held";
      provisioningAction = "HOLD";
      activationEligible = false;
      continuityEligible = false;
      reason = "Past-due subscription state bridged into held provisioning posture.";
      break;

    case "suspended":
      entitlementState = "suspended";
      provisioningAction = "SUSPEND";
      activationEligible = false;
      continuityEligible = false;
      reason = "Suspended subscription state bridged into suspended entitlement posture.";
      break;

    case "cancelled":
      entitlementState = "revoked";
      provisioningAction = "REVOKE";
      activationEligible = false;
      continuityEligible = false;
      reason = "Cancelled subscription state bridged into revoked entitlement posture.";
      break;

    case "refund_recorded":
      entitlementState = "revoked";
      provisioningAction = "REVOKE";
      activationEligible = false;
      continuityEligible = false;
      reason = "Refund-recorded subscription state bridged into revoked entitlement posture.";
      break;

    case "pending_review":
      entitlementState = "review_required";
      provisioningAction = "REVIEW";
      activationEligible = false;
      continuityEligible = false;
      reason = "Pending-review subscription state bridged into review-required entitlement posture.";
      break;

    default:
      return {
        ok: false,
        artifact: null,
        refusal: {
          refusalCode: "UNSUPPORTED_SUBSCRIPTION_STATE",
          refusalReason: `Provisioning entitlement bridge refused because subscription state '${input.subscriptionState.subscriptionState}' is unsupported.`,
        },
      };
  }

  const artifact: ProvisioningEntitlementArtifact = {
    entitlementId: makeEntitlementId(input.subscriptionState.subscriptionStateId),
    subjectId: input.subjectId,
    customerId: input.subscriptionState.customerId,
    subscriptionId: input.subscriptionState.subscriptionId,
    packageId: input.packageId ?? null,
    featureSet: input.featureSet ?? [],
    entitlementState,
    provisioningAction,
    activationEligible,
    continuityEligible,
    sourceSubscriptionStateId: input.subscriptionState.subscriptionStateId,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}