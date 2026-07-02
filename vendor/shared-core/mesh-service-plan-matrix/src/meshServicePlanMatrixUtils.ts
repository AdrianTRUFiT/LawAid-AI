import type { MeshPlanCode } from "./meshServicePlanMatrixTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makePlanMatrixId(subjectId: string, planCode: MeshPlanCode): string {
  return `mesh_plan_${subjectId}_${planCode}`;
}

export function isMeshPlanCode(value: string): value is MeshPlanCode {
  return ["MONTHLY", "PAY_PER_USE", "GROUP_PLAN"].includes(value);
}