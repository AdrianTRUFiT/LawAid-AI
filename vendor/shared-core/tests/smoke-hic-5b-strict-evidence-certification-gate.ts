import {
  AnalogObservation,
  convertHILApprovedObservation,
  createAnalogCustodyRecord,
  createLawAidAIReceivingInputPacket,
  createLawAidAIReviewPacket,
  createSourceReferencePacket,
  evaluateSourceReferencedObservation,
  getStrictEvidenceCertificationLedgerPath,
  recordAnalogCustody,
  recordHybridLedgerEntry,
  recordLawAidAIReceivingInput,
  recordLawAidAIReviewPacket,
  recordSourceReference,
  recordStrictEvidenceCertificationResult,
  strictEvidenceCertificationGate
} from "../hybrid-intelligence-conversion";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function buildReadyReviewPacket() {
  const observation: AnalogObservation = {
    observationId: "hic5b-approved-001",
    capturedAt: new Date().toISOString(),
    capturedBy: "human-operator",
    realitySource: "physical_document",
    summary: "User approved a custody-referenced physical document for strict evidence certification testing.",
    rawReference: "binder-G-tab-5",
    humanPresent: true,
    humanApprovedForConversion: true
  };

  const custody = createAnalogCustodyRecord({
    observation,
    createdBy: "human-operator",
    sourceReference: "binder-G-tab-5",
    storageLocation: "operator-controlled physical binder",
    possessionState: "in_human_possession",
    sourceDescription: "Physical source document prepared for strict evidence boundary testing."
  });

  assert(custody.custodyStatus === "custody_recorded", "Custody recorded before strict evidence gate");
  recordAnalogCustody(custody);

  const sourcePacket = createSourceReferencePacket(custody);
  assert(sourcePacket.packetStatus === "source_reference_ready", "Source reference ready before strict evidence gate");
  recordSourceReference(sourcePacket);

  const hilDecision = evaluateSourceReferencedObservation(observation, sourcePacket);
  assert(hilDecision.status === "HIL_APPROVED", "HIL approves before strict evidence gate");

  const conversion = convertHILApprovedObservation(observation, hilDecision);
  assert(conversion.status === "HIC_CONVERTED", "HIC converts before strict evidence gate");
  recordHybridLedgerEntry(observation, hilDecision, conversion);

  const receiving = createLawAidAIReceivingInputPacket({
    custody,
    sourceReferencePacket: sourcePacket,
    hilDecision,
    hicConversion: conversion
  });

  assert(receiving.receivingStatus === "RECEIVING_INPUT_READY", "Receiving ready before strict evidence gate");
  recordLawAidAIReceivingInput(receiving);

  const review = createLawAidAIReviewPacket(receiving);
  assert(review.reviewStatus === "REVIEW_PACKET_READY", "Review ready before strict evidence gate");
  assert(review.reviewScope.mayCertifyEvidence === false, "Review cannot certify evidence");
  recordLawAidAIReviewPacket(review);

  return review;
}

const reviewPacket = buildReadyReviewPacket();

const reviewOnlyResult = strictEvidenceCertificationGate({ reviewPacket });
assert(reviewOnlyResult.resultStatus === "EVIDENCE_PACKET_NOT_CREATED", "Review alone creates no Evidence packet");
assert(reviewOnlyResult.reason === "REVIEW_ALONE_CANNOT_CREATE_EVIDENCE", "Review alone is refused as evidence");
assert(!reviewOnlyResult.evidencePacket, "Review-only result contains no Evidence packet");
assert(reviewOnlyResult.boundary.reviewIsNotEvidence === true, "Review-not-evidence boundary preserved");
recordStrictEvidenceCertificationResult(reviewOnlyResult);

const invalidResult = strictEvidenceCertificationGate({
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

assert(invalidResult.resultStatus === "EVIDENCE_PACKET_NOT_CREATED", "Invalid certification creates no Evidence packet");
assert(invalidResult.reason === "INVALID_EXTERNAL_CERTIFICATION", "Invalid certification is refused");
assert(!invalidResult.evidencePacket, "Invalid certification result contains no Evidence packet");
assert(invalidResult.boundary.invalidCertificationCreatesNoEvidencePacket === true, "No-packet-on-invalid-certification boundary preserved");
const invalidLedger = recordStrictEvidenceCertificationResult(invalidResult);
assert(invalidLedger.status === "evidence_packet_not_created", "Strict ledger records no packet for invalid certification");

const validResult = strictEvidenceCertificationGate({
  reviewPacket,
  externalCertificationAuthority: {
    authorityId: "licensed-professional-001",
    authorityType: "licensed_professional",
    authorityName: "Licensed Professional Reviewer",
    certifiedAt: new Date().toISOString(),
    certificationScope: "External certification of referenced evidence status for downstream review.",
    certificationReference: "licensed-cert-ref-001",
    valid: true
  }
});

assert(validResult.resultStatus === "EVIDENCE_PACKET_CREATED", "Valid certification creates Evidence packet");
assert(validResult.reason === "VALID_EXTERNAL_CERTIFICATION", "Valid certification is accepted");
assert(Boolean(validResult.evidencePacket), "Valid certification result contains Evidence packet");
assert(validResult.evidencePacket?.evidenceStatus === "EVIDENCE_CERTIFIED", "Created Evidence packet is certified");
assert(validResult.evidencePacket?.evidenceEligibility === "eligible_for_action_review", "Certified Evidence is eligible for action review only");
assert(validResult.evidencePacket?.boundary.evidenceDoesNotTriggerAction === true, "Evidence still does not trigger action");
assert(validResult.evidencePacket?.boundary.actionRequiresActivationAuthority === true, "Action still requires activation authority");

const validLedger = recordStrictEvidenceCertificationResult(validResult);
assert(validLedger.status === "evidence_packet_created", "Strict ledger records created Evidence packet");
assert(validLedger.authorityBoundary.evidenceDoesNotTriggerAction === true, "Strict ledger preserves evidence-not-action boundary");
assert(getStrictEvidenceCertificationLedgerPath().includes("strict-evidence-certification-gate-ledger.jsonl"), "Strict evidence certification ledger path is available");

console.log("");
console.log("HIC_5B_STRICT_EVIDENCE_CERTIFICATION_GATE_SMOKE=PASS");









