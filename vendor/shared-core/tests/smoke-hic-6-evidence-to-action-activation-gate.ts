import {
  AnalogObservation,
  actionActivationGate,
  convertHILApprovedObservation,
  createAnalogCustodyRecord,
  createLawAidAIReceivingInputPacket,
  createLawAidAIReviewPacket,
  createSourceReferencePacket,
  evaluateSourceReferencedObservation,
  getLawAidAIActionLedgerPath,
  recordAnalogCustody,
  recordHybridLedgerEntry,
  recordLawAidAIActionGateResult,
  recordLawAidAIReceivingInput,
  recordLawAidAIReviewPacket,
  recordSourceReference,
  strictEvidenceCertificationGate
} from "../hybrid-intelligence-conversion";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function buildCertifiedEvidencePacket() {
  const observation: AnalogObservation = {
    observationId: "hic6-approved-001",
    capturedAt: new Date().toISOString(),
    capturedBy: "human-operator",
    realitySource: "physical_document",
    summary: "User approved a custody-referenced physical document for evidence-to-action activation testing.",
    rawReference: "binder-H-tab-8",
    humanPresent: true,
    humanApprovedForConversion: true
  };

  const custody = createAnalogCustodyRecord({
    observation,
    createdBy: "human-operator",
    sourceReference: "binder-H-tab-8",
    storageLocation: "operator-controlled physical binder",
    possessionState: "in_human_possession",
    sourceDescription: "Physical source document prepared for evidence-to-action activation testing."
  });

  assert(custody.custodyStatus === "custody_recorded", "Custody recorded before action gate");
  recordAnalogCustody(custody);

  const sourcePacket = createSourceReferencePacket(custody);
  assert(sourcePacket.packetStatus === "source_reference_ready", "Source reference ready before action gate");
  recordSourceReference(sourcePacket);

  const hilDecision = evaluateSourceReferencedObservation(observation, sourcePacket);
  assert(hilDecision.status === "HIL_APPROVED", "HIL approves before action gate");

  const conversion = convertHILApprovedObservation(observation, hilDecision);
  assert(conversion.status === "HIC_CONVERTED", "HIC converts before action gate");
  recordHybridLedgerEntry(observation, hilDecision, conversion);

  const receiving = createLawAidAIReceivingInputPacket({
    custody,
    sourceReferencePacket: sourcePacket,
    hilDecision,
    hicConversion: conversion
  });

  assert(receiving.receivingStatus === "RECEIVING_INPUT_READY", "Receiving ready before action gate");
  recordLawAidAIReceivingInput(receiving);

  const review = createLawAidAIReviewPacket(receiving);
  assert(review.reviewStatus === "REVIEW_PACKET_READY", "Review ready before action gate");
  recordLawAidAIReviewPacket(review);

  const strictEvidence = strictEvidenceCertificationGate({
    reviewPacket: review,
    externalCertificationAuthority: {
      authorityId: "court-certifier-001",
      authorityType: "court",
      authorityName: "Court Certification Authority",
      certifiedAt: new Date().toISOString(),
      certificationScope: "External certification of referenced evidence for action review testing.",
      certificationReference: "court-cert-ref-001",
      valid: true
    }
  });

  assert(strictEvidence.resultStatus === "EVIDENCE_PACKET_CREATED", "Certified Evidence packet created before action gate");
  assert(Boolean(strictEvidence.evidencePacket), "Evidence packet exists before action gate");

  return strictEvidence.evidencePacket!;
}

const noEvidenceResult = actionActivationGate({});
assert(noEvidenceResult.resultStatus === "ACTION_PACKET_NOT_CREATED", "No Evidence cannot create Action");
assert(noEvidenceResult.reason === "NO_EVIDENCE_PACKET", "No Evidence is refused at action gate");
assert(!noEvidenceResult.actionPacket, "No Evidence result contains no Action packet");
recordLawAidAIActionGateResult(noEvidenceResult);

const certifiedEvidence = buildCertifiedEvidencePacket();

const noAuthorityResult = actionActivationGate({
  evidencePacket: certifiedEvidence
});

assert(noAuthorityResult.resultStatus === "ACTION_PACKET_NOT_CREATED", "Certified Evidence without activation authority creates no Action");
assert(noAuthorityResult.reason === "ACTIVATION_AUTHORITY_REQUIRED", "Certified Evidence requires activation authority");
assert(!noAuthorityResult.actionPacket, "No-authority result contains no Action packet");
assert(noAuthorityResult.boundary.evidenceDoesNotTriggerAction === true, "Evidence does not trigger Action");
recordLawAidAIActionGateResult(noAuthorityResult);

const wrongAuthorityResult = actionActivationGate({
  evidencePacket: certifiedEvidence,
  activationAuthority: {
    authorityId: "wrong-authority-001",
    stewardName: "Review Only User",
    stewardRole: "user",
    authorityLevel: "review_only",
    activatedAt: new Date().toISOString(),
    explicitActivation: true,
    activationScope: "Attempted action activation with insufficient authority.",
    activationReference: "wrong-auth-ref-001",
    valid: true
  }
});

assert(wrongAuthorityResult.resultStatus === "ACTION_PACKET_NOT_CREATED", "Wrong authority creates no Action");
assert(wrongAuthorityResult.reason === "INVALID_ACTIVATION_AUTHORITY", "Wrong authority is refused");
assert(!wrongAuthorityResult.actionPacket, "Wrong-authority result contains no Action packet");
recordLawAidAIActionGateResult(wrongAuthorityResult);

const validAuthorityResult = actionActivationGate({
  evidencePacket: certifiedEvidence,
  activationAuthority: {
    authorityId: "authorized-human-steward-001",
    stewardName: "Authorized Human Steward",
    stewardRole: "authorized_human_steward",
    authorityLevel: "final_action_authority",
    activatedAt: new Date().toISOString(),
    explicitActivation: true,
    activationScope: "Explicit activation of action packet after certified Evidence review.",
    activationReference: "activation-ref-001",
    valid: true
  }
});

assert(validAuthorityResult.resultStatus === "ACTION_PACKET_CREATED", "Correct activation authority creates Action packet");
assert(validAuthorityResult.reason === "ACTION_CREATED_BY_PROPER_AUTHORITY", "Action created by proper authority");
assert(Boolean(validAuthorityResult.actionPacket), "Valid authority result contains Action packet");
assert(validAuthorityResult.actionPacket?.boundary.evidenceDoesNotTriggerAction === true, "Action packet preserves evidence-not-action boundary");
assert(validAuthorityResult.actionPacket?.boundary.actionRequiresActivationAuthority === true, "Action packet preserves activation authority boundary");
assert(validAuthorityResult.actionPacket?.boundary.actionDoesNotCreateTruth === true, "Action does not create truth");
assert(validAuthorityResult.actionPacket?.boundary.actionDoesNotCertifyEvidence === true, "Action does not certify evidence");
assert(validAuthorityResult.actionPacket?.sourceChain === "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action", "Action packet preserves full chain");

const actionLedger = recordLawAidAIActionGateResult(validAuthorityResult);
assert(actionLedger.status === "action_packet_created", "Action ledger records created Action packet");
assert(actionLedger.authorityBoundary.humanActivationRequired === true, "Action ledger preserves human activation requirement");
assert(getLawAidAIActionLedgerPath().includes("lawaidai-action-ledger.jsonl"), "Action ledger path is available");

console.log("");
console.log("HIC_6_EVIDENCE_TO_ACTION_ACTIVATION_GATE_SMOKE=PASS");









