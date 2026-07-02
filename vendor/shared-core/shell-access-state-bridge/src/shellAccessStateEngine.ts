import type {
  ShellAccessStateArtifact,
  ShellAccessStateInput,
  ShellAccessStateResult,
} from "./shellAccessStateTypes.js";
import { makeShellAccessId, nowIso } from "./shellAccessStateUtils.js";

export function runShellAccessStateBridge(
  input: ShellAccessStateInput,
): ShellAccessStateResult {
  if (!input.entitlement) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_ENTITLEMENT",
        refusalReason: "Shell access bridge refused because entitlement is missing.",
      },
    };
  }

  if (input.subjectId !== input.entitlement.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Shell access bridge refused because subjectId does not match entitlement subjectId.",
      },
    };
  }

  let shellAccessState:
    | "active_shell"
    | "limited_shell"
    | "blocked_shell"
    | "review_shell"
    | "revoked_shell";

  let shellAccessMode:
    | "FULL"
    | "LIMITED"
    | "BLOCKED"
    | "REVIEW"
    | "REVOKED";

  let continuityEligible = false;
  let reason = "";

  switch (input.entitlement.entitlementState) {
    case "entitled":
      shellAccessState = "active_shell";
      shellAccessMode = "FULL";
      continuityEligible = input.entitlement.continuityEligible;
      reason = "Entitled provisioning posture bridged into active shell access.";
      break;

    case "held":
      shellAccessState = "limited_shell";
      shellAccessMode = "LIMITED";
      continuityEligible = false;
      reason = "Held provisioning posture bridged into limited shell access.";
      break;

    case "suspended":
      shellAccessState = "blocked_shell";
      shellAccessMode = "BLOCKED";
      continuityEligible = false;
      reason = "Suspended entitlement posture bridged into blocked shell access.";
      break;

    case "review_required":
      shellAccessState = "review_shell";
      shellAccessMode = "REVIEW";
      continuityEligible = false;
      reason = "Review-required entitlement posture bridged into review shell access.";
      break;

    case "revoked":
      shellAccessState = "revoked_shell";
      shellAccessMode = "REVOKED";
      continuityEligible = false;
      reason = "Revoked entitlement posture bridged into revoked shell access.";
      break;

    default:
      return {
        ok: false,
        artifact: null,
        refusal: {
          refusalCode: "UNSUPPORTED_ENTITLEMENT_STATE",
          refusalReason: `Shell access bridge refused because entitlement state '${input.entitlement.entitlementState}' is unsupported.`,
        },
      };
  }

  const artifact: ShellAccessStateArtifact = {
    shellAccessId: makeShellAccessId(input.entitlement.entitlementId),
    subjectId: input.subjectId,
    customerId: input.entitlement.customerId,
    subscriptionId: input.entitlement.subscriptionId,
    shellAccessState,
    shellAccessMode,
    continuityEligible,
    sourceEntitlementId: input.entitlement.entitlementId,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}