import type { MeshServiceCatalogArtifact } from "../../mesh-service-catalog/src/index.js";
import type { MeshServicePlanMatrixArtifact } from "../../mesh-service-plan-matrix/src/index.js";

export type MeshPriorityClass =
  | "critical"
  | "high"
  | "normal"
  | "throttled";

export interface MeshOperationsPolicyInput {
  subjectId: string;
  service: MeshServiceCatalogArtifact | null;
  plan: MeshServicePlanMatrixArtifact | null;
  networkLoadPercent: number;
}

export interface MeshOperationsPolicyArtifact {
  operationsPolicyId: string;
  subjectId: string;
  serviceCode: string;
  planCode: string;
  priorityClass: MeshPriorityClass;
  bandwidthCapKbps: number;
  throttlingApplied: boolean;
  continuityPriorityRetained: boolean;
  fairnessRule: string;
  reason: string;
  createdAt: string;
}

export interface MeshOperationsPolicyRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "INVALID_NETWORK_LOAD"
    | "CATEGORY_NOT_ALLOWED";
  refusalReason: string;
}

export interface MeshOperationsPolicyResult {
  ok: boolean;
  artifact: MeshOperationsPolicyArtifact | null;
  refusal: MeshOperationsPolicyRefusal | null;
}