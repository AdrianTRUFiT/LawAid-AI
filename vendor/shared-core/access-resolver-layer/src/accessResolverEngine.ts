import type {
  AccessResolverArtifact,
  AccessResolverInput,
  AccessResolverResult,
} from "./accessResolverTypes.js";
import { makeAccessResolverId, nowIso } from "./accessResolverUtils.js";

export function runAccessResolver(
  input: AccessResolverInput,
): AccessResolverResult {
  if (!input.identityActive) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "IDENTITY_INACTIVE",
        refusalReason: "Access resolver refused because identity is not active.",
      },
    };
  }

  if (!input.entitlementPackage) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "NO_ENTITLEMENT",
        refusalReason: "Access resolver refused because no entitlement package exists.",
      },
    };
  }

  if (
    input.subjectId !== input.entitlementPackage.subjectId ||
    input.subjectId !== input.shellAccess.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Access resolver refused because identity does not match entitlement or shell access state.",
      },
    };
  }

  let accessMode: "FULL_ACCESS" | "TRIAL_ACCESS" | "LIMITED_ACCESS" | "ARCHIVED_ACCESS";
  let availableRights: string[] = [];
  let blockedRights: string[] = [];
  let archivedVisibility = false;
  let returnPathEligible = false;
  let reason = "";

  if (input.lifecycleState === "ACTIVE_PAID" && input.shellAccess.shellAccessMode === "FULL") {
    accessMode = "FULL_ACCESS";
    availableRights = input.entitlementPackage.rights;
    blockedRights = [];
    archivedVisibility = false;
    returnPathEligible = false;
    reason = "Active paid lifecycle and full shell access resolved into full access.";
  } else if (input.lifecycleState === "ACTIVE_TRIAL" && input.shellAccess.shellAccessMode === "FULL") {
    accessMode = "TRIAL_ACCESS";
    availableRights = input.entitlementPackage.rights;
    blockedRights = ["paid_only_extensions"];
    archivedVisibility = false;
    returnPathEligible = false;
    reason = "Active trial lifecycle resolved into trial access.";
  } else if (
    (input.lifecycleState === "GRACE" || input.lifecycleState === "PAST_DUE") &&
    (input.shellAccess.shellAccessMode === "LIMITED" || input.shellAccess.shellAccessMode === "BLOCKED")
  ) {
    accessMode = "LIMITED_ACCESS";
    availableRights = input.policyFlags?.allowGraceLimitedAccess === false ? [] : ["continuity_view"];
    blockedRights = input.entitlementPackage.rights.filter((x) => x !== "continuity_view");
    archivedVisibility = false;
    returnPathEligible = true;
    reason = "Grace or past-due lifecycle resolved into limited continuity-preserving access.";
  } else if (
    (input.lifecycleState === "ARCHIVED" || input.lifecycleState === "EXPIRED" || input.lifecycleState === "CANCELED_PERIOD_END") &&
    (input.shellAccess.shellAccessMode === "REVOKED" || input.shellAccess.shellAccessMode === "REVIEW" || input.shellAccess.shellAccessMode === "LIMITED")
  ) {
    accessMode = "ARCHIVED_ACCESS";
    availableRights = input.policyFlags?.archiveVisible === false ? [] : ["archived_visibility"];
    blockedRights = input.entitlementPackage.rights;
    archivedVisibility = input.policyFlags?.archiveVisible === false ? false : true;
    returnPathEligible = true;
    reason = "Closed lifecycle resolved into archived access with protected return path.";
  } else {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "UNSUPPORTED_ACCESS_COMBINATION",
        refusalReason: `Access resolver refused because lifecycle '${input.lifecycleState}' and shell mode '${input.shellAccess.shellAccessMode}' are unsupported together.`,
      },
    };
  }

  const artifact: AccessResolverArtifact = {
    accessResolverId: makeAccessResolverId(input.subjectId, input.lifecycleState),
    subjectId: input.subjectId,
    accessMode,
    availableRights,
    blockedRights,
    archivedVisibility,
    returnPathEligible,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}