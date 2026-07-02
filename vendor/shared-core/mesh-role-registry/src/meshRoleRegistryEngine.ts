import type {
  MeshRoleRegistryArtifact,
  MeshRoleRegistryInput,
  MeshRoleRegistryResult,
} from "./meshRoleRegistryTypes.js";
import {
  isMeshRoleCode,
  makeMeshRoleRegistryId,
  nowIso,
} from "./meshRoleRegistryUtils.js";

export function runMeshRoleRegistry(
  input: MeshRoleRegistryInput,
): MeshRoleRegistryResult {
  if (!isMeshRoleCode(input.roleCode)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_ROLE",
        refusalReason: `Mesh role registry refused because role '${input.roleCode}' is invalid.`,
      },
    };
  }

  let responsibilityClass: "infrastructure" | "operations" | "commercial" | "support" | "content";
  let canAffectStations = false;
  let canAffectRelays = false;
  let canAffectBilling = false;
  let canAffectContent = false;
  let reason = "";

  switch (input.roleCode) {
    case "NETWORK_BUILDER":
      responsibilityClass = "infrastructure";
      canAffectStations = true;
      reason = "Network builder governs station installation and anchor layout.";
      break;

    case "RELAY_TECHNICIAN":
      responsibilityClass = "operations";
      canAffectRelays = true;
      reason = "Relay technician governs relay placement and signal extension.";
      break;

    case "BILLING_MANAGER":
      responsibilityClass = "commercial";
      canAffectBilling = true;
      reason = "Billing manager governs payment collection and billing operations.";
      break;

    case "CUSTOMER_SUPPORT":
      responsibilityClass = "support";
      reason = "Customer support assists users with connection and continuity issues.";
      break;

    case "CONTENT_MANAGER":
      responsibilityClass = "content";
      canAffectContent = true;
      reason = "Content manager governs what content classes are made available.";
      break;
  }

  const artifact: MeshRoleRegistryArtifact = {
    roleRegistryId: makeMeshRoleRegistryId(input.subjectId, input.roleCode),
    subjectId: input.subjectId,
    roleCode: input.roleCode,
    responsibilityClass,
    canAffectStations,
    canAffectRelays,
    canAffectBilling,
    canAffectContent,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}