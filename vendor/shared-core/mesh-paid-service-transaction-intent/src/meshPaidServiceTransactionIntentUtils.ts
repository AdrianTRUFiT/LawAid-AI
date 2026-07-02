import type { MeshTransactionIntentClass } from "./meshPaidServiceTransactionIntentTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeTransactionIntentId(
  subjectId: string,
  serviceCode: string,
  planCode: string,
): string {
  return `mesh_tx_intent_${subjectId}_${serviceCode}_${planCode}`;
}

export function classifyIntent(planCode: string): MeshTransactionIntentClass {
  switch (planCode) {
    case "MONTHLY":
      return "subscription_intent";
    case "PAY_PER_USE":
      return "metered_intent";
    case "GROUP_PLAN":
      return "shared_group_intent";
    default:
      return "metered_intent";
  }
}