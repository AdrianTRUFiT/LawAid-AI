import type {
  CityLayerOpportunityMapperArtifact,
  CityLayerOpportunityMapperInput,
  CityLayerOpportunityMapperResult,
  OpportunitySurfaceClass,
} from "./cityLayerOpportunityMapperTypes.js";
import {
  makeCityLayerOpportunityMapId,
  nowIso,
} from "./cityLayerOpportunityMapperUtils.js";

export function runCityLayerOpportunityMapper(
  input: CityLayerOpportunityMapperInput,
): CityLayerOpportunityMapperResult {
  if (!input.adaptiveConversionPlan) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "City-layer opportunity mapper refused because adaptive conversion plan input is missing.",
      },
    };
  }

  if (input.subjectId !== input.adaptiveConversionPlan.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "City-layer opportunity mapper refused because subject identity does not match adaptive conversion plan input.",
      },
    };
  }

  let opportunitySurfaceClass: OpportunitySurfaceClass;
  let primaryLayer: CityLayerOpportunityMapperArtifact["primaryLayer"];
  let recommendedOpportunityTypes: string[];

  switch (input.adaptiveConversionPlan.primaryConversionTrack) {
    case "sensor_instrumentation":
      opportunitySurfaceClass = "sensor_field_surface";
      primaryLayer = "energy";
      recommendedOpportunityTypes = [
        "sensors",
        "transponders",
        "control_modules",
        "field_components",
      ];
      break;
    case "machine_automation":
      opportunitySurfaceClass = "automation_workflow_surface";
      primaryLayer = "mobility";
      recommendedOpportunityTypes = [
        "automation_workflows",
        "connectors",
        "communications_layers",
        "routing_modules",
      ];
      break;
    case "hybrid_exception_layer":
      opportunitySurfaceClass = "hybrid_exception_surface";
      primaryLayer = "health_safety";
      recommendedOpportunityTypes = [
        "audit_tools",
        "anomaly_resolution_services",
        "verification_interfaces",
        "interoperability_tools",
      ];
      break;
    default:
      opportunitySurfaceClass = "human_governance_surface";
      primaryLayer = "governance";
      recommendedOpportunityTypes = [
        "governance_interfaces",
        "override_surfaces",
        "approval_controls",
        "coordination_tools",
      ];
      break;
  }

  const artifact: CityLayerOpportunityMapperArtifact = {
    cityLayerOpportunityMapId: makeCityLayerOpportunityMapId(input.subjectId),
    subjectId: input.subjectId,
    settlementType: input.adaptiveConversionPlan.settlementType,
    opportunitySurfaceClass,
    primaryLayer,
    recommendedOpportunityTypes,
    reason: "Adaptive conversion plan translated into city-layer opportunity surfaces.",
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}