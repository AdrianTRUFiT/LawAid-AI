import type { CityLayerOpportunityMapperArtifact } from "../../city-layer-opportunity-mapper/src/index.js";

export type AbsorbedRoleClass =
  | "generic_reporting"
  | "logistics_coordination"
  | "routine_monitoring"
  | "basic_permit_processing";

export interface AbsorbedRoleSignal {
  absorbedRoleId: string;
  subjectId: string;
  absorbedRoleClass: AbsorbedRoleClass;
  reason: string;
  createdAt: string;
}

export interface EnablerDemandArtifact {
  enablerDemandId: string;
  subjectId: string;
  absorbedRoleClass: AbsorbedRoleClass;
  demandClass:
    | "sensor_and_field_devices"
    | "automation_and_connectors"
    | "hybrid_audit_and_exception"
    | "governance_and_override_tools";
  recommendedDemandItems: string[];
  reason: string;
  createdAt: string;
}

export interface AbsorbedRoleToEnablerDemandInput {
  subjectId: string;
  cityLayerOpportunityMap: CityLayerOpportunityMapperArtifact | null;
  absorbedRoleSignal: AbsorbedRoleSignal | null;
}

export interface AbsorbedRoleToEnablerDemandRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface AbsorbedRoleToEnablerDemandResult {
  ok: boolean;
  artifact: EnablerDemandArtifact | null;
  refusal: AbsorbedRoleToEnablerDemandRefusal | null;
}