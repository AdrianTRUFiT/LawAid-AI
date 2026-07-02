import type {
  AbsorbedRoleToEnablerDemandInput,
  AbsorbedRoleToEnablerDemandResult,
  EnablerDemandArtifact,
} from "./absorbedRoleToEnablerDemandTypes.js";
import {
  makeEnablerDemandId,
  nowIso,
} from "./absorbedRoleToEnablerDemandUtils.js";

export function runAbsorbedRoleToEnablerDemandBridge(
  input: AbsorbedRoleToEnablerDemandInput,
): AbsorbedRoleToEnablerDemandResult {
  if (!input.cityLayerOpportunityMap || !input.absorbedRoleSignal) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Absorbed-role to enabler-demand bridge refused because opportunity map or absorbed-role signal input is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.cityLayerOpportunityMap.subjectId ||
    input.subjectId !== input.absorbedRoleSignal.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Absorbed-role to enabler-demand bridge refused because subject identity does not match across inputs.",
      },
    };
  }

  let demandClass: EnablerDemandArtifact["demandClass"];
  let recommendedDemandItems: string[];

  switch (input.absorbedRoleSignal.absorbedRoleClass) {
    case "generic_reporting":
      demandClass = "sensor_and_field_devices";
      recommendedDemandItems = ["sensors", "meters", "field_transponders", "monitoring_devices"];
      break;
    case "logistics_coordination":
      demandClass = "automation_and_connectors";
      recommendedDemandItems = ["connectors", "routing_modules", "communications_bridges", "automation_adapters"];
      break;
    case "routine_monitoring":
      demandClass = "hybrid_audit_and_exception";
      recommendedDemandItems = ["audit_tools", "verification_interfaces", "exception_handlers", "maintenance_monitors"];
      break;
    default:
      demandClass = "governance_and_override_tools";
      recommendedDemandItems = ["approval_interfaces", "override_controls", "policy_tools", "role_reassignment_controls"];
      break;
  }

  const artifact: EnablerDemandArtifact = {
    enablerDemandId: makeEnablerDemandId(input.subjectId),
    subjectId: input.subjectId,
    absorbedRoleClass: input.absorbedRoleSignal.absorbedRoleClass,
    demandClass,
    recommendedDemandItems,
    reason: "Absorbed workflow role translated into enabler-demand intelligence.",
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}