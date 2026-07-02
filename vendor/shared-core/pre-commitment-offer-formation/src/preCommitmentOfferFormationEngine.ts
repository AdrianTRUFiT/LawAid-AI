import type {
  OfferClass,
  PreCommitmentOfferArtifact,
  PreCommitmentOfferFormationInput,
  PreCommitmentOfferFormationResult,
  PreCommitmentOfferStatus,
} from "./preCommitmentOfferFormationTypes.js";
import {
  makePreCommitmentOfferId,
  nowIso,
} from "./preCommitmentOfferFormationUtils.js";

export function runPreCommitmentOfferFormation(
  input: PreCommitmentOfferFormationInput,
): PreCommitmentOfferFormationResult {
  if (!input.sourceSelection) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Pre-commitment offer formation refused because source-selection input is missing.",
      },
    };
  }

  if (input.subjectId !== input.sourceSelection.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Pre-commitment offer formation refused because subject identity does not match source-selection input.",
      },
    };
  }

  if (!Number.isFinite(input.offerAmountMinor) || input.offerAmountMinor <= 0 || !input.currency) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_OFFER",
        refusalReason: "Pre-commitment offer formation refused because offer amount or currency is invalid.",
      },
    };
  }

  let preCommitmentOfferStatus: PreCommitmentOfferStatus;
  let offerClass: OfferClass = "none";
  let commitmentWindowOpen = false;
  let reason = "";

  if (input.sourceSelection.sourceSelectionStatus === "SOURCE_REFUSED") {
    preCommitmentOfferStatus = "OFFER_REFUSED";
    reason = "Source selection was refused, so no offer may form.";
  } else if (input.sourceSelection.sourceSelectionStatus === "SOURCE_HELD") {
    preCommitmentOfferStatus = "OFFER_HELD";
    reason = "Source selection is held, so the offer remains held.";
  } else {
    preCommitmentOfferStatus = "OFFER_READY";
    commitmentWindowOpen = input.sourceSelection.releaseEligible;
    offerClass = input.sourceSelection.selectedSourceType === "pooled" ? "pooled_offer" : "isolated_offer";
    reason = "Governed pre-commitment offer formed from selected source.";
  }

  const artifact: PreCommitmentOfferArtifact = {
    preCommitmentOfferId: makePreCommitmentOfferId(input.subjectId),
    subjectId: input.subjectId,
    preCommitmentOfferStatus,
    offerClass,
    selectedSourceId: input.sourceSelection.selectedSourceId,
    offerAmountMinor: input.offerAmountMinor,
    currency: input.currency,
    commitmentWindowOpen,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}