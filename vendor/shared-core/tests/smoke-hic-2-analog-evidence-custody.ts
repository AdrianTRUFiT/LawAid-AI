import {
  AnalogObservation,
  convertHILApprovedObservation,
  createAnalogCustodyRecord,
  createSourceReferencePacket,
  evaluateSourceReferencedObservation,
  getAnalogCustodyLedgerPath,
  getSourceReferenceLedgerPath,
  recordAnalogCustody,
  recordHybridLedgerEntry,
  recordSourceReference
} from "../hybrid-intelligence-conversion";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const incompleteObservation: AnalogObservation = {
  observationId: "analog-custody-incomplete-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "physical_document",
  summary: "Document seen.",
  humanPresent: false,
  humanApprovedForConversion: true
};

const incompleteCustody = createAnalogCustodyRecord({
  observation: incompleteObservation,
  createdBy: "human-operator",
  sourceReference: "",
  sourceDescription: "Doc"
});

assert(incompleteCustody.custodyStatus === "custody_incomplete", "Incomplete analog custody is not recorded as complete");
assert(incompleteCustody.authorityBoundary.custodyRecordIsNotTruth === true, "Custody record is not truth");
assert(incompleteCustody.authorityBoundary.aiDoesNotOwnSource === true, "AI does not own analog source");

const incompletePacket = createSourceReferencePacket(incompleteCustody);
assert(incompletePacket.packetStatus === "source_reference_incomplete", "Incomplete custody cannot create ready source reference");
assert(incompletePacket.eligibleForHILReview === false, "Incomplete source reference is not eligible for HIL review");

const refusedDecision = evaluateSourceReferencedObservation(incompleteObservation, incompletePacket);
assert(refusedDecision.status === "HIL_REFUSED", "HIL refuses source packet that is not ready");

const approvedObservation: AnalogObservation = {
  observationId: "analog-custody-approved-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "physical_document",
  summary: "User provided a physical document and approved source-referenced conversion.",
  rawReference: "binder-A-tab-3",
  humanPresent: true,
  humanApprovedForConversion: true
};

const custody = createAnalogCustodyRecord({
  observation: approvedObservation,
  createdBy: "human-operator",
  sourceReference: "binder-A-tab-3",
  storageLocation: "operator-controlled physical binder",
  possessionState: "in_human_possession",
  sourceDescription: "Physical document stored in operator-controlled binder, tab 3."
});

assert(custody.custodyStatus === "custody_recorded", "Complete analog custody is recorded");
assert(custody.humanCustodianPresent === true, "Human custodian is present");
assert(custody.authorityBoundary.sourceReferenceIsNotAuthority === true, "Source reference is not authority");

const custodyLedgerEntry = recordAnalogCustody(custody);
assert(custodyLedgerEntry.status === "custody_recorded", "Custody ledger records custody state");

const packet = createSourceReferencePacket(custody);
assert(packet.packetStatus === "source_reference_ready", "Complete custody creates ready source reference packet");
assert(packet.eligibleForHILReview === true, "Ready source reference is eligible for HIL review");
assert(packet.boundary.packetDoesNotCertifyTruth === true, "Source reference packet does not certify truth");
assert(packet.boundary.hilMustReviewBeforeHic === true, "Source reference packet requires HIL before HIC");

const sourceLedgerEntry = recordSourceReference(packet);
assert(sourceLedgerEntry.status === "source_reference_recorded", "Source reference ledger records packet state");

const hilDecision = evaluateSourceReferencedObservation(approvedObservation, packet);
assert(hilDecision.status === "HIL_APPROVED", "HIL approves complete source-referenced observation");

const conversion = convertHILApprovedObservation(approvedObservation, hilDecision);
assert(conversion.status === "HIC_CONVERTED", "HIC converts source-referenced HIL-approved observation");
assert(conversion.authorityBoundary.conversionIsNotTruth === true, "Source-referenced HIC conversion is not truth");

const hybridEntry = recordHybridLedgerEntry(approvedObservation, hilDecision, conversion);
assert(hybridEntry.chain === "Reality -> HIL -> HIC -> AIOS", "Hybrid ledger preserves correct chain after source reference");
assert(hybridEntry.status === "recorded", "Hybrid ledger records source-referenced conversion");

assert(getAnalogCustodyLedgerPath().includes("analog-custody-ledger.jsonl"), "Analog custody ledger path is available");
assert(getSourceReferenceLedgerPath().includes("source-reference-ledger.jsonl"), "Source reference ledger path is available");

console.log("");
console.log("HIC_2_ANALOG_EVIDENCE_CUSTODY_SMOKE=PASS");









