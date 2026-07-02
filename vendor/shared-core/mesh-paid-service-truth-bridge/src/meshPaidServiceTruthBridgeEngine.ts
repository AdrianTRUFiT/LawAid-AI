import type {
  MeshPaidServiceTruthArtifact,
  MeshPaidServiceTruthBridgeInput,
  MeshPaidServiceTruthBridgeResult,
} from "./meshPaidServiceTruthBridgeTypes.js";
import {
  makePaidTruthId,
  mapProcessorStatusToTruth,
  nowIso,
} from "./meshPaidServiceTruthBridgeUtils.js";

export function runMeshPaidServiceTruthBridge(
  input: MeshPaidServiceTruthBridgeInput,
): MeshPaidServiceTruthBridgeResult {
  if (!input.transactionIntent || !input.processorEvent) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Mesh paid service truth bridge refused because transaction intent or processor event is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.transactionIntent.subjectId ||
    input.subjectId !== input.processorEvent.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Mesh paid service truth bridge refused because subject identity does not match across inputs.",
      },
    };
  }

  if (input.transactionIntent.amountMinor !== input.processorEvent.amountMinor) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "AMOUNT_MISMATCH",
        refusalReason: `Mesh paid service truth bridge refused because amount '${input.processorEvent.amountMinor}' does not match intent amount '${input.transactionIntent.amountMinor}'.`,
      },
    };
  }

  if (input.transactionIntent.currency !== input.processorEvent.currency.toUpperCase()) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "CURRENCY_MISMATCH",
        refusalReason: `Mesh paid service truth bridge refused because currency '${input.processorEvent.currency}' does not match intent currency '${input.transactionIntent.currency}'.`,
      },
    };
  }

  const paidTruthStatus = mapProcessorStatusToTruth(input.processorEvent.processorStatus);
  const commercialTruthReady = paidTruthStatus === "PAID_CONFIRMED";
  const requiresReview = paidTruthStatus === "PAID_HELD_REVIEW";

  let reason = "";
  switch (paidTruthStatus) {
    case "PAID_CONFIRMED":
      reason = "Processor-adjacent outcome verified into governed paid mesh truth.";
      break;
    case "PAID_HELD_REVIEW":
      reason = "Processor-adjacent outcome held for governed review before paid mesh truth can activate downstream access.";
      break;
    case "PAID_REFUSED":
      reason = "Processor-adjacent outcome refused and did not become governed paid mesh truth for activation.";
      break;
  }

  const artifact: MeshPaidServiceTruthArtifact = {
    paidTruthId: makePaidTruthId(
      input.subjectId,
      input.transactionIntent.transactionIntentId,
      input.processorEvent.processorReference,
    ),
    subjectId: input.subjectId,
    transactionIntentId: input.transactionIntent.transactionIntentId,
    processorReference: input.processorEvent.processorReference,
    serviceCode: input.transactionIntent.serviceCode,
    planCode: input.transactionIntent.planCode,
    amountMinor: input.transactionIntent.amountMinor,
    currency: input.transactionIntent.currency,
    paidTruthStatus,
    commercialTruthReady,
    requiresReview,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}