import {
  AnalogObservation,
  convertHILApprovedObservation,
  createAnalogCustodyRecord,
  createLawAidAIReceivingInputPacket,
  createSourceReferencePacket,
  evaluateSourceReferencedObservation,
  getLawAidAIReceivingLedgerPath,
  recordAnalogCustody,
  recordHybridLedgerEntry,
  recordLawAidAIReceivingInput,
  recordSourceReference
} from "../hybrid-intelligence-conversion";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const unapprovedObservation: AnalogObservation = {
  observationId: "hic3-unapproved-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "physical_document",
  summary: "Physical document exists but has not been approved for conversion.",
  rawReference: "binder-B-tab-1",
  humanPresent: true,
  humanApprovedForConversion: false
};

const unapprovedCustody = createAnalogCustodyRecord({
  observation: unapprovedObservation,
  createdBy: "human-operator",
  sourceReference: "binder-B-tab-1",
  storageLocation: "operator-controlled binder",
  possessionState: "in_human_possession",
  sourceDescription: "Physical document exists but approval is not granted."
});

const unapprovedSourcePacket = createSourceReferencePacket(unapprovedCustody);
const unapprovedDecision = evaluateSourceReferencedObservation(
  unapprovedObservation,
  unapprovedSourcePacket
);
const refusedConversion = convertHILApprovedObservation(
  unapprovedObservation,
  unapprovedDecision
);

const heldReceivingPacket = createLawAidAIReceivingInputPacket({
  custody: unapprovedCustody,
  sourceReferencePacket: unapprovedSourcePacket,
  hilDecision: unapprovedDecision,
  hicConversion: refusedConversion
});

assert(heldReceivingPacket.receivingStatus === "RECEIVING_INPUT_HELD", "Unapproved source-referenced input is held at receiving");
assert(heldReceivingPacket.receivingEligibility === "held_for_review", "Held receiving input cannot enter LawAidAI review");
assert(heldReceivingPacket.requiredCorrections.includes("HIL_APPROVAL_REQUIRED"), "Held receiving input requires HIL approval");
assert(heldReceivingPacket.boundary.receivingIsNotAuthority === true, "Receiving packet is not authority");
assert(heldReceivingPacket.boundary.receivingIsNotActivation === true, "Receiving packet is not activation");
assert(heldReceivingPacket.boundary.receivingDoesNotVerifyTruth === true, "Receiving packet does not verify truth");

const approvedObservation: AnalogObservation = {
  observationId: "hic3-approved-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "physical_document",
  summary: "User approved a physical document for LawAidAI receiving intake.",
  rawReference: "binder-C-tab-7",
  humanPresent: true,
  humanApprovedForConversion: true
};

const custody = createAnalogCustodyRecord({
  observation: approvedObservation,
  createdBy: "human-operator",
  sourceReference: "binder-C-tab-7",
  storageLocation: "operator-controlled physical binder",
  possessionState: "in_human_possession",
  sourceDescription: "Physical source document prepared for LawAidAI receiving intake."
});

assert(custody.custodyStatus === "custody_recorded", "Custody is recorded before receiving packet");
recordAnalogCustody(custody);

const sourcePacket = createSourceReferencePacket(custody);
assert(sourcePacket.packetStatus === "source_reference_ready", "Source reference is ready before HIL review");
recordSourceReference(sourcePacket);

const hilDecision = evaluateSourceReferencedObservation(approvedObservation, sourcePacket);
assert(hilDecision.status === "HIL_APPROVED", "HIL approves before HIC conversion");

const conversion = convertHILApprovedObservation(approvedObservation, hilDecision);
assert(conversion.status === "HIC_CONVERTED", "HIC converts before LawAidAI receiving");
recordHybridLedgerEntry(approvedObservation, hilDecision, conversion);

const receivingPacket = createLawAidAIReceivingInputPacket({
  custody,
  sourceReferencePacket: sourcePacket,
  hilDecision,
  hicConversion: conversion
});

assert(receivingPacket.receivingStatus === "RECEIVING_INPUT_READY", "Approved HIC conversion creates LawAidAI receiving-ready packet");
assert(receivingPacket.receivingEligibility === "eligible_for_lawaidai_review", "Receiving packet is eligible for LawAidAI review");
assert(receivingPacket.sourceChain === "Reality -> HIL -> HIC -> LawAidAI Receiving", "Receiving packet preserves source chain");
assert(receivingPacket.boundary.sourceTraceRequired === true, "Receiving packet requires source trace");
assert(receivingPacket.boundary.receivingDoesNotCertifyEvidence === true, "Receiving packet does not certify evidence");

const receivingLedger = recordLawAidAIReceivingInput(receivingPacket);
assert(receivingLedger.status === "receiving_recorded", "LawAidAI receiving ledger records ready input");
assert(receivingLedger.authorityBoundary.receivingIsNotAuthority === true, "Receiving ledger is not authority");
assert(getLawAidAIReceivingLedgerPath().includes("lawaidai-receiving-input-ledger.jsonl"), "LawAidAI receiving ledger path is available");

console.log("");
console.log("HIC_3_LAWAIDAI_RECEIVING_BRIDGE_SMOKE=PASS");









