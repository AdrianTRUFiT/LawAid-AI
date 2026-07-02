import type {
  TreasuryVisibilityArtifact,
  TreasuryVisibilityInput,
  TreasuryVisibilityResult,
} from "./treasuryVisibilityTypes.js";
import { makeTreasuryRecordId, nowIso } from "./treasuryVisibilityUtils.js";

export function runTreasuryVisibilityLedger(
  input: TreasuryVisibilityInput,
): TreasuryVisibilityResult {
  if (!input.settlementPolicy) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_SETTLEMENT_POLICY",
        refusalReason: "Treasury visibility refused because settlement policy artifact is missing.",
      },
    };
  }

  if (input.subjectId !== input.settlementPolicy.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Treasury visibility refused because subjectId does not match settlement policy subjectId.",
      },
    };
  }

  if (
    !input.settlementPolicy.receivedAsset ||
    input.settlementPolicy.receivedAmount <= 0 ||
    !input.settlementPolicy.receivedCurrency
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MALFORMED_SETTLEMENT_POLICY",
        refusalReason: "Treasury visibility refused because settlement policy artifact is malformed.",
      },
    };
  }

  const exceptionState =
    input.settlementPolicy.reviewRequired === true
      ? "review_required"
      : "none";

  const artifact: TreasuryVisibilityArtifact = {
    treasuryRecordId: makeTreasuryRecordId(input.settlementPolicy.settlementPolicyId),
    subjectId: input.subjectId,
    sourceSettlementPolicyId: input.settlementPolicy.settlementPolicyId,
    receivedAsset: input.settlementPolicy.receivedAsset,
    receivedAmount: input.settlementPolicy.receivedAmount,
    receivedCurrency: input.settlementPolicy.receivedCurrency,
    settlementDecision: input.settlementPolicy.settlementDecision,
    settlementAsset: input.settlementPolicy.settlementAsset,
    reserveDestination: input.reserveDestination ?? null,
    exceptionState,
    visibilityReason: "Settlement policy translated into treasury visibility record.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}