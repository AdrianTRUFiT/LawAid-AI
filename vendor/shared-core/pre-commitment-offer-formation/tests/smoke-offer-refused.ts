import { runPreCommitmentOfferFormation } from "../src/index.js";

const result = runPreCommitmentOfferFormation({
  subjectId: "offer_003",
  offerAmountMinor: 25000,
  currency: "USD",
  sourceSelection: {
    sourceSelectionId: "source_selection_offer_003",
    subjectId: "offer_003",
    sourceSelectionStatus: "SOURCE_REFUSED",
    selectedSourceId: null,
    selectedSourceType: "none",
    releaseWindowClass: "delayed",
    releaseEligible: false,
    sourceCompositeScore: 0,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.preCommitmentOfferStatus !== "OFFER_REFUSED") {
  throw new Error("Expected blocked source refusal.");
}

console.log("SMOKE_OFFER_REFUSED=PASS");