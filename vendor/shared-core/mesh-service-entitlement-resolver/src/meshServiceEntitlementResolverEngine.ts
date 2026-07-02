import type {
  MeshServiceEntitlementArtifact,
  MeshServiceEntitlementResolverInput,
  MeshServiceEntitlementResolverResult,
  MeshEntitlementStatus,
} from "./meshServiceEntitlementResolverTypes.js";
import {
  deriveServiceRights,
  makeEntitlementId,
  nowIso,
} from "./meshServiceEntitlementResolverUtils.js";

export function runMeshServiceEntitlementResolver(
  input: MeshServiceEntitlementResolverInput,
): MeshServiceEntitlementResolverResult {
  if (!input.paidTruth || !input.service || !input.plan) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Mesh service entitlement resolver refused because paid truth, service, or plan input is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.paidTruth.subjectId ||
    input.subjectId !== input.service.subjectId ||
    input.subjectId !== input.plan.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Mesh service entitlement resolver refused because subject identity does not match across inputs.",
      },
    };
  }

  if (input.paidTruth.serviceCode !== input.service.serviceCode) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SERVICE_MISMATCH",
        refusalReason: `Mesh service entitlement resolver refused because paid truth service '${input.paidTruth.serviceCode}' does not match service '${input.service.serviceCode}'.`,
      },
    };
  }

  if (input.paidTruth.planCode !== input.plan.planCode) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "PLAN_MISMATCH",
        refusalReason: `Mesh service entitlement resolver refused because paid truth plan '${input.paidTruth.planCode}' does not match plan '${input.plan.planCode}'.`,
      },
    };
  }

  let entitlementStatus: MeshEntitlementStatus;
  let accessClass: "active" | "held" | "blocked";
  let transactionalAccessReady = false;
  let reason = "";

  switch (input.paidTruth.paidTruthStatus) {
    case "PAID_CONFIRMED":
      entitlementStatus = "ENTITLED_ACTIVE";
      accessClass = "active";
      transactionalAccessReady = true;
      reason = "Paid mesh truth confirmed and resolved into active entitlement.";
      break;

    case "PAID_HELD_REVIEW":
      entitlementStatus = "ENTITLED_HELD_REVIEW";
      accessClass = "held";
      transactionalAccessReady = false;
      reason = "Paid mesh truth held for review and resolved into held entitlement.";
      break;

    case "PAID_REFUSED":
      entitlementStatus = "ENTITLED_REFUSED";
      accessClass = "blocked";
      transactionalAccessReady = false;
      reason = "Paid mesh truth refused and resolved into blocked entitlement.";
      break;
  }

  const serviceRights = deriveServiceRights(
    input.service.serviceCode,
    input.plan.planCode,
  );

  const artifact: MeshServiceEntitlementArtifact = {
    entitlementId: makeEntitlementId(
      input.subjectId,
      input.paidTruth.paidTruthId,
      input.service.serviceCode,
      input.plan.planCode,
    ),
    subjectId: input.subjectId,
    paidTruthId: input.paidTruth.paidTruthId,
    serviceCode: input.service.serviceCode,
    serviceCategory: input.service.category,
    planCode: input.plan.planCode,
    entitlementStatus,
    serviceRights,
    continuityPriorityGranted:
      input.service.continuityCritical && input.plan.supportsContinuityPriority,
    accessClass,
    transactionalAccessReady,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}