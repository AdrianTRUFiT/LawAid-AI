import type { MeshServiceCategory } from "../../mesh-service-catalog/src/index.js";

export type MeshPlanCode =
  | "MONTHLY"
  | "PAY_PER_USE"
  | "GROUP_PLAN";

export interface MeshServicePlanMatrixInput {
  subjectId: string;
  planCode: string;
}

export interface MeshServicePlanMatrixArtifact {
  planMatrixId: string;
  subjectId: string;
  planCode: MeshPlanCode;
  allowedCategories: MeshServiceCategory[];
  supportsTransactions: boolean;
  supportsContinuityPriority: boolean;
  pricingMode: "subscription" | "metered" | "shared";
  reason: string;
  createdAt: string;
}

export interface MeshServicePlanMatrixRefusal {
  refusalCode: "INVALID_PLAN";
  refusalReason: string;
}

export interface MeshServicePlanMatrixResult {
  ok: boolean;
  artifact: MeshServicePlanMatrixArtifact | null;
  refusal: MeshServicePlanMatrixRefusal | null;
}