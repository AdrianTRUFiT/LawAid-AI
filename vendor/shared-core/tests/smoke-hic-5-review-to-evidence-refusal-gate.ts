import {
  AnalogObservation,
  convertHILApprovedObservation,
  createAnalogCustodyRecord,
  createEvidencePacketFromExternalCertification,
  createLawAidAIReceivingInputPacket,
  createLawAidAIReviewPacket,
  createSourceReferencePacket,
  evaluateSourceReferencedObservation,
  getLawAidAIEvidenceLedgerPath,
  recordAnalogCustody,
  recordHybridLedgerEntry,
  recordLawAidAIEvidencePacket,
  recordLawAidAIReceivingInput,
  recordLawAidAIReviewPacket,
  recordSourceReference,
  refuseReviewAsEvidence
} from "../hybrid-intelligence-conversion";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function buildReadyReviewPacket() {
  const observation: AnalogObservation = {
    observationId: "hic5-approved-001",
    capturedAt: new Date().toISOString(),
    capturedBy: "human-operator",
    realitySource: "physical_document",
    summary: "User approved a custody-referenced physical document for review-to-evidence boundary testing.",
    rawReference: "binder-F-tab-4",
    humanPresent: true,
    humanApprovedForConversion: true
  };

  const custody = createAnalogCustodyRecord({
    observation,
    createdBy: "human-operator",
    sourceReference: "binder-F-tab-4",
    storageLocation: "operator-controlled physical binder",
    possessionState: "in_human_possession",
    sourceDescription: "Physical source document prepared for evidence boundary testing."
  });

  assert(custody.custodyStatus === "custody_recorded", "Custody recorded before evidence gate");
  recordAnalogCustody(custody);

  const sourcePacket = createSourceReferencePacket(custody);
  assert(sourcePacket.packetStatus === "source_reference_ready", "Source reference ready before evidence gate");
  recordSourceReference(sourcePacket);

  const hilDecision = evaluateSourceReferencedObservation(observation, sourcePacket);
  assert(hilDecision.status === "HIL_APPROVED", "HIL approves before evidence gate");

  const conversion = convertHILApprovedObservation(observation, hilDecision);
  assert(conversion.status === "HIC_CONVERTED", "HIC converts before evidence gate");
  recordHybridLedgerEntry(observation, hilDecision, conversion);

  const receiving = createLawAidAIReceivingInputPacket({
    custody,
    sourceReferencePacket: sourcePacket,
    hilDecision,
    hicConversion: conversion
  });

  assert(receiving.receivingStatus === "RECEIVING_INPUT_READY", "Receiving ready before evidence gate");
  recordLawAidAIReceivingInput(receiving);

  const review = createLawAidAIReviewPacket(receiving);
  assert(review.reviewStatus === "REVIEW_PACKET_READY", "Review ready before evidence gate");
  assert(review.reviewScope.mayCertifyEvidence === false, "Review scope cannot certify evidence");
  recordLawAidAIReviewPacket(review);

  return review;
}

const reviewPacket = buildReadyReviewPacket();

const refusedFromReview = refuseReviewAsEvidence(reviewPacket);
assert(refusedFromReview.evidenceStatus === "EVIDENCE_HELD_FOR_EXTERNAL_CERTIFICATION", "Review alone is held for external certification");
assert(refusedFromReview.evidenceEligibility === "held_for_external_certification", "Review alone is not evidence-eligible for action");
assert(refusedFromReview.externalCertificationRequired === true, "External certification is required");
assert(refusedFromReview.externalCertificationPresent === false, "Review alone has no external certification");
assert(refusedFromReview.requiredCorrections.includes("EXTERNAL_CERTIFICATION_AUTHORITY_REQUIRED"), "Review alone requires external certification authority");
assert(refusedFromReview.boundary.reviewIsNotEvidence === true, "Review is not evidence boundary preserved");
assert(refusedFromReview.boundary.lawAidAIMayNotCertifyEvidence === true, "LawAidAI may not certify evidence");
assert(refusedFromReview.boundary.evidenceDoesNotTriggerAction === true, "Evidence gate does not trigger action");

const refusedLedger = recordLawAidAIEvidencePacket(refusedFromReview);
assert(refusedLedger.status === "evidence_held_for_external_certification", "Evidence ledger records held-for-certification status");

const invalidExternalAttempt = createEvidencePacketFromExternalCertification({
  reviewPacket,
  externalCertificationAuthority: {
    authorityId: "bad",
    authorityType: "other",
    authorityName: "",
    certifiedAt: new Date().toISOString(),
    certificationScope: "",
    certificationReference: "",
    valid: false
  }
});

assert(invalidExternalAttempt.evidenceStatus === "EVIDENCE_REFUSED", "Invalid external certification is refused");
assert(invalidExternalAttempt.evidenceEligibility === "refused", "Invalid certification is not eligible for action review");
assert(invalidExternalAttempt.requiredCorrections.includes("VALID_EXTERNAL_CERTIFICATION_AUTHORITY_REQUIRED"), "Valid external authority is required");

const certifiedEvidence = createEvidencePacketFromExternalCertification({
  reviewPacket,
  externalCertificationAuthority: {
    authorityId: "external-authority-001",
    authorityType: "qualified_external_reviewer",
    authorityName: "Qualified External Reviewer",
    certifiedAt: new Date().toISOString(),
    certificationScope: "External certification of referenced evidence status for downstream review.",
    certificationReference: "external-cert-ref-001",
    valid: true,
    notes: [
      "External/correct authority supplied for evidence boundary test."
    ]
  }
});

assert(certifiedEvidence.evidenceStatus === "EVIDENCE_CERTIFIED", "External authority can certify evidence packet");
assert(certifiedEvidence.evidenceEligibility === "eligible_for_action_review", "Certified evidence becomes eligible for action review only");
assert(certifiedEvidence.externalCertificationPresent === true, "External certification is present");
assert(certifiedEvidence.boundary.lawAidAIMayNotCertifyEvidence === true, "LawAidAI still may not certify evidence internally");
assert(certifiedEvidence.boundary.evidenceDoesNotTriggerAction === true, "Certified evidence still does not trigger action");
assert(certifiedEvidence.boundary.actionRequiresActivationAuthority === true, "Action still requires activation authority");

const certifiedLedger = recordLawAidAIEvidencePacket(certifiedEvidence);
assert(certifiedLedger.status === "evidence_certified_external", "Evidence ledger records external certification status");
assert(certifiedLedger.authorityBoundary.evidenceDoesNotTriggerAction === true, "Evidence ledger preserves evidence-not-action boundary");
assert(getLawAidAIEvidenceLedgerPath().includes("lawaidai-evidence-ledger.jsonl"), "Evidence ledger path is available");

console.log("");
console.log("HIC_5_REVIEW_TO_EVIDENCE_REFUSAL_GATE_SMOKE=PASS");









