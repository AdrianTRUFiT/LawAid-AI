import type { AdaptiveConversionPlanArtifact } from "../../adaptive-conversion-plan-bridge/src/index.js";

export type OpportunitySurfaceClass =
  | "sensor_field_surface"
  | "automation_workflow_surface"
  | "hybrid_exception_surface"
  | "human_governance_surface";

export interface CityLayerOpportunityMapperInput {
  subjectId: string;
  adaptiveConversionPlan: AdaptiveConversionPlanArtifact | null;
}

export interface CityLayerOpportunityMapperArtifact {
  cityLayerOpportunityMapId: string;
  subjectId: string;
  settlementType: "town" | "city" | "community";
  opportunitySurfaceClass: OpportunitySurfaceClass;
  primaryLayer:
    | "energy"
    | "water_waste"
    | "shelter"
    | "production"
    | "mobility"
    | "food"
    | "health_safety"
    | "governance";
  recommendedOpportunityTypes: string[];
  reason: string;
  createdAt: string;
}

export interface CityLayerOpportunityMapperRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface CityLayerOpportunityMapperResult {
  ok: boolean;
  artifact: CityLayerOpportunityMapperArtifact | null;
  refusal: CityLayerOpportunityMapperRefusal | null;
}