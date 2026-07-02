import type {
  MeshPaidServiceTransactionIntentArtifact,
  MeshPaidServiceTransactionIntentInput,
  MeshPaidServiceTransactionIntentResult,
} from "./meshPaidServiceTransactionIntentTypes.js";
import {
  classifyIntent,
  makeTransactionIntentId,
  nowIso,
} from "./meshPaidServiceTransactionIntentUtils.js";

export function runMeshPaidServiceTransactionIntent(
  input: MeshPaidServiceTransactionIntentInput,
): MeshPaidServiceTransactionIntentResult {
  if (!input.service || !input.plan) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Mesh paid service transaction intent refused because service or plan input is missing.",
      },
    };
  }

  if (!Number.isFinite(input.amountMinor) || input.amountMinor <= 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_AMOUNT",
        refusalReason: `Mesh paid service transaction intent refused because amount '${input.amountMinor}' is invalid.`,
      },
    };
  }

  if (!input.plan.allowedCategories.includes(input.service.category)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "CATEGORY_NOT_ALLOWED",
        refusalReason: `Mesh paid service transaction intent refused because category '${input.service.category}' is not allowed by plan '${input.plan.planCode}'.`,
      },
    };
  }

  const transactionIntentClass = classifyIntent(input.plan.planCode);

  const artifact: MeshPaidServiceTransactionIntentArtifact = {
    transactionIntentId: makeTransactionIntentId(
      input.subjectId,
      input.service.serviceCode,
      input.plan.planCode,
    ),
    subjectId: input.subjectId,
    serviceCode: input.service.serviceCode,
    serviceCategory: input.service.category,
    planCode: input.plan.planCode,
    transactionIntentClass,
    amountMinor: input.amountMinor,
    currency: input.currency.toUpperCase(),
    transactionalEligible: input.service.transactionalEligible && input.plan.supportsTransactions,
    continuityPriorityRequested: input.service.continuityCritical && input.plan.supportsContinuityPriority,
    reason: "Mesh paid service transaction intent formed from governed service + plan selection.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}