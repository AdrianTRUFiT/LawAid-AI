import {
  AnalogObservation,
  convertHILApprovedObservation,
  createAnalogCustodyRecord,
  createLawAidAIReceivingInputPacket,
  createLawAidAIReviewPacket,
  createSourceReferencePacket,
  evaluateSourceReferencedObservation,
  getLawAidAIReviewLedgerPath,
  recordAnalogCustody,
  recordHybridLedgerEntry,
  recordLawAidAIReceivingInput,
  recordLawAidAIReviewPacket,
  recordSourceReference
} from "../hybrid-intelligence-conversion";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const unapprovedObservation: AnalogObservation = {
  observationId: "hic4-unapproved-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "physical_document",
  summary: "Physical document exists but is not approved for conversion.",
  rawReference: "binder-D-tab-2",
  humanPresent: true,
  humanApprovedForConversion: false
};

const unapprovedCustody = createAnalogCustodyRecord({
  observation: unapprovedObservation,
  createdBy: "human-operator",
  sourceReference: "binder-D-tab-2",
  storageLocation: "operator-controlled binder",
  possessionState: "in_human_possession",
  sourceDescription: "Physical document exists, but no conversion approval exists."
});

const unapprovedSourcePacket = createSourceReferencePacket(unapprovedCustody);
const unapprovedHIL = evaluateSourceReferencedObservation(unapprovedObservation, unapprovedSourcePacket);
const unapprovedHIC = convertHILApprovedObservation(unapprovedObservation, unapprovedHIL);

const heldReceiving = createLawAidAIReceivingInputPacket({
  custody: unapprovedCustody,
  sourceReferencePacket: unapprovedSourcePacket,
  hilDecision: unapprovedHIL,
  hicConversion: unapprovedHIC
});

assert(heldReceiving.receivingStatus === "RECEIVING_INPUT_HELD", "Unapproved input is held at receiving");

const heldReview = createLawAidAIReviewPacket(heldReceiving);
assert(heldReview.reviewStatus === "REVIEW_PACKET_HELD", "Held receiving input cannot become review-ready");
assert(heldReview.reviewEligibility === "held_for_review", "Held review packet remains held");
assert(heldReview.requiredCorrections.includes("RECEIVING_INPUT_READY_REQUIRED"), "Review requires ready receiving input");
assert(heldReview.boundary.reviewIsNotEvidence === true, "Held review still preserves review-not-evidence boundary");
assert(heldReview.boundary.reviewIsNotAction === true, "Held review still preserves review-not-action boundary");

const approvedObservation: AnalogObservation = {
  observationId: "hic4-approved-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "physical_document",
  summary: "User approved a custody-referenced physical document for LawAidAI review intake.",
  rawReference: "binder-E-tab-9",
  humanPresent: true,
  humanApprovedForConversion: true
};

const custody = createAnalogCustodyRecord({
  observation: approvedObservation,
  createdBy: "human-operator",
  sourceReference: "binder-E-tab-9",
  storageLocation: "operator-controlled physical binder",
  possessionState: "in_human_possession",
  sourceDescription: "Physical source document prepared for LawAidAI review after receiving."
});

assert(custody.custodyStatus === "custody_recorded", "Custody recorded before source reference");
recordAnalogCustody(custody);

const sourcePacket = createSourceReferencePacket(custody);
assert(sourcePacket.packetStatus === "source_reference_ready", "Source reference ready before HIL");
recordSourceReference(sourcePacket);

const hilDecision = evaluateSourceReferencedObservation(approvedObservation, sourcePacket);
assert(hilDecision.status === "HIL_APPROVED", "HIL approves before HIC");

const conversion = convertHILApprovedObservation(approvedObservation, hilDecision);
assert(conversion.status === "HIC_CONVERTED", "HIC converts before receiving");
recordHybridLedgerEntry(approvedObservation, hilDecision, conversion);

const receivingPacket = createLawAidAIReceivingInputPacket({
  custody,
  sourceReferencePacket: sourcePacket,
  hilDecision,
  hicConversion: conversion
});

assert(receivingPacket.receivingStatus === "RECEIVING_INPUT_READY", "Receiving is ready before review");
assert(receivingPacket.receivingEligibility === "eligible_for_lawaidai_review", "Receiving eligibility exists before review");
recordLawAidAIReceivingInput(receivingPacket);

const reviewPacket = createLawAidAIReviewPacket(receivingPacket);
assert(reviewPacket.reviewStatus === "REVIEW_PACKET_READY", "Ready receiving input creates review-ready packet");
assert(reviewPacket.reviewEligibility === "eligible_for_governed_interpretation", "Review eligibility permits governed interpretation");
assert(reviewPacket.sourceChain === "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review", "Review packet preserves full source chain");
assert(reviewPacket.boundary.reviewIsNotEvidence === true, "Review is not evidence");
assert(reviewPacket.boundary.reviewIsNotAction === true, "Review is not action");
assert(reviewPacket.boundary.reviewIsNotExternalCertification === true, "Review is not external certification");
assert(reviewPacket.boundary.reviewIsNotActivationAuthority === true, "Review is not activation authority");
assert(reviewPacket.boundary.reviewDoesNotVerifyTruth === true, "Review does not verify truth");
assert(reviewPacket.reviewScope.mayCertifyEvidence === false, "Review cannot certify evidence");
assert(reviewPacket.reviewScope.mayTriggerAction === false, "Review cannot trigger action");
assert(reviewPacket.reviewScope.mayCreateActivationAuthority === false, "Review cannot create activation authority");
assert(reviewPacket.reviewScope.mayCreateTruthClaim === false, "Review cannot create truth claim");

const reviewLedger = recordLawAidAIReviewPacket(reviewPacket);
assert(reviewLedger.status === "review_recorded", "Review ledger records ready review packet");
assert(reviewLedger.authorityBoundary.reviewIsNotEvidence === true, "Review ledger preserves not-evidence boundary");
assert(reviewLedger.authorityBoundary.reviewIsNotAction === true, "Review ledger preserves not-action boundary");
assert(getLawAidAIReviewLedgerPath().includes("lawaidai-review-ledger.jsonl"), "Review ledger path is available");

console.log("");
console.log("HIC_4_RECEIVING_TO_REVIEW_GATE_SMOKE=PASS");









