import type {
  FundTrackerIntakeNormalizationArtifact,
  FundTrackerIntakeNormalizationInput,
  FundTrackerIntakeNormalizationResult,
  FundTrackerIntakeStatus,
} from "./fundTrackerIntakeNormalizationTypes.js";
import {
  makeFundTrackerIntakeNormalizationId,
  nowIso,
} from "./fundTrackerIntakeNormalizationUtils.js";

export function runFundTrackerIntakeNormalizationBridge(
  input: FundTrackerIntakeNormalizationInput,
): FundTrackerIntakeNormalizationResult {
  if (!input.fundTrackerHandoffCandidate) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "FundTracker intake normalization refused because handoff candidate input is missing.",
      },
    };
  }

  if (input.subjectId !== input.fundTrackerHandoffCandidate.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "FundTracker intake normalization refused because subject identity does not match handoff candidate input.",
      },
    };
  }

  if (input.fundTrackerHandoffCandidate.routeTarget !== "FundTrackerAI") {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_ROUTE_TARGET",
        refusalReason: "FundTracker intake normalization refused because the route target is not FundTrackerAI.",
      },
    };
  }

  let fundTrackerIntakeStatus: FundTrackerIntakeStatus;
  let normalizedForTransact = false;
  let reviewRequired = false;
  let reason = "";

  if (input.fundTrackerHandoffCandidate.fundTrackerHandoffCandidateStatus === "FUNDTRACKER_HANDOFF_REFUSED") {
    fundTrackerIntakeStatus = "FUNDTRACKER_INTAKE_REFUSED";
    reason = "FundTracker handoff candidate was refused, so intake is refused.";
  } else if (input.fundTrackerHandoffCandidate.fundTrackerHandoffCandidateStatus === "FUNDTRACKER_HANDOFF_HELD") {
    fundTrackerIntakeStatus = "FUNDTRACKER_INTAKE_HELD";
    reviewRequired = true;
    reason = "FundTracker handoff candidate is held, so intake remains held.";
  } else {
    fundTrackerIntakeStatus = "FUNDTRACKER_INTAKE_READY";
    normalizedForTransact = true;
    reason = "FundTracker handoff candidate normalized successfully for Transact.";
  }

  const artifact: FundTrackerIntakeNormalizationArtifact = {
    fundTrackerIntakeNormalizationId: makeFundTrackerIntakeNormalizationId(input.subjectId),
    subjectId: input.subjectId,
    fundTrackerIntakeStatus,
    handoffCandidateId: input.fundTrackerHandoffCandidate.fundTrackerHandoffCandidateId,
    routeTarget: "FundTrackerAI",
    normalizedForTransact,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}