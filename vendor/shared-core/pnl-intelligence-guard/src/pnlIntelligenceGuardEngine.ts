import type {
  PnlIntelligenceGuardArtifact,
  PnlIntelligenceGuardInput,
  PnlIntelligenceGuardResult,
  PnlGuardStatus,
} from "./pnlIntelligenceGuardTypes.js";
import {
  makePnlGuardId,
  nowIso,
} from "./pnlIntelligenceGuardUtils.js";

export function runPnlIntelligenceGuard(
  input: PnlIntelligenceGuardInput,
): PnlIntelligenceGuardResult {
  if (!input.poolingThreshold || !input.qualityGate) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "P&L intelligence guard refused because pooling threshold or quality gate input is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.poolingThreshold.subjectId ||
    input.subjectId !== input.qualityGate.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "P&L intelligence guard refused because subject identity does not match across inputs.",
      },
    };
  }

  if (
    !Number.isFinite(input.expectedRevenueMinor) ||
    !Number.isFinite(input.expectedCostMinor) ||
    input.expectedRevenueMinor <= 0 ||
    input.expectedCostMinor < 0
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_ECONOMICS",
        refusalReason: "P&L intelligence guard refused because expected economics are invalid.",
      },
    };
  }

  const expectedMarginMinor = input.expectedRevenueMinor - input.expectedCostMinor;
  const expectedMarginRatio = expectedMarginMinor / input.expectedRevenueMinor;

  let pnlGuardStatus: PnlGuardStatus;
  let releaseEconomicallySafe = false;
  let reason = "";

  if (input.qualityGate.qualityGateStatus === "QUALITY_REFUSED") {
    pnlGuardStatus = "PNL_REFUSED";
    reason = "Quality was refused, so economic advancement is refused.";
  } else if (expectedMarginMinor < 0 || expectedMarginRatio < 0) {
    pnlGuardStatus = "PNL_REFUSED";
    reason = "Expected margin is negative, so commercial advancement is refused.";
  } else if (expectedMarginRatio < 0.12 || input.qualityGate.qualityGateStatus === "QUALITY_HELD") {
    pnlGuardStatus = "PNL_HELD";
    reason = "Expected margin is too thin or quality remains held, so economic advancement is held.";
  } else {
    pnlGuardStatus = "PNL_PASSED";
    reason = "Expected economics and quality conditions are strong enough to advance.";
  }

  if (
    pnlGuardStatus === "PNL_PASSED" &&
    (
      input.poolingThreshold.poolingStatus === "POOLING_READY" ||
      input.poolingThreshold.poolingStatus === "ISOLATED"
    ) &&
    input.qualityGate.releaseSafe
  ) {
    releaseEconomicallySafe = true;
  }

  const artifact: PnlIntelligenceGuardArtifact = {
    pnlGuardId: makePnlGuardId(input.subjectId),
    subjectId: input.subjectId,
    pnlGuardStatus,
    expectedRevenueMinor: input.expectedRevenueMinor,
    expectedCostMinor: input.expectedCostMinor,
    expectedMarginMinor,
    expectedMarginRatio,
    releaseEconomicallySafe,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}