import type {
  MeshServiceAccessActivationArtifact,
  MeshServiceAccessActivationBridgeInput,
  MeshServiceAccessActivationBridgeResult,
  MeshAccessActivationStatus,
} from "./meshServiceAccessActivationBridgeTypes.js";
import {
  deriveActivationRights,
  makeAccessActivationId,
  nowIso,
} from "./meshServiceAccessActivationBridgeUtils.js";

export function runMeshServiceAccessActivationBridge(
  input: MeshServiceAccessActivationBridgeInput,
): MeshServiceAccessActivationBridgeResult {
  if (!input.entitlement) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Mesh service access activation bridge refused because entitlement input is missing.",
      },
    };
  }

  if (input.subjectId !== input.entitlement.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Mesh service access activation bridge refused because subject identity does not match entitlement input.",
      },
    };
  }

  let accessActivationStatus: MeshAccessActivationStatus;
  let serviceReady = false;
  let environmentClass: "live" | "held" | "blocked";
  let reason = "";

  switch (input.entitlement.entitlementStatus) {
    case "ENTITLED_ACTIVE":
      accessActivationStatus = "ACCESS_ACTIVE";
      serviceReady = true;
      environmentClass = "live";
      reason = "Entitlement resolved into live service activation.";
      break;

    case "ENTITLED_HELD_REVIEW":
      accessActivationStatus = "ACCESS_HELD";
      serviceReady = false;
      environmentClass = "held";
      reason = "Entitlement resolved into held service activation pending review.";
      break;

    case "ENTITLED_REFUSED":
      accessActivationStatus = "ACCESS_BLOCKED";
      serviceReady = false;
      environmentClass = "blocked";
      reason = "Entitlement resolved into blocked service activation.";
      break;
  }

  const activationRights = deriveActivationRights(
    input.entitlement.serviceCode,
    input.entitlement.planCode,
    accessActivationStatus,
  );

  const artifact: MeshServiceAccessActivationArtifact = {
    accessActivationId: makeAccessActivationId(
      input.subjectId,
      input.entitlement.entitlementId,
      input.entitlement.serviceCode,
      input.entitlement.planCode,
    ),
    subjectId: input.subjectId,
    entitlementId: input.entitlement.entitlementId,
    serviceCode: input.entitlement.serviceCode,
    planCode: input.entitlement.planCode,
    accessActivationStatus,
    serviceReady,
    continuityPriorityActive:
      input.entitlement.continuityPriorityGranted && accessActivationStatus === "ACCESS_ACTIVE",
    activationRights,
    environmentClass,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}