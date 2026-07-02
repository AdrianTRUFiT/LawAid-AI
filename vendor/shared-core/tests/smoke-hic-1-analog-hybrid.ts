import {
  AnalogObservation,
  convertHILApprovedObservation,
  evaluateHILObservation,
  getHybridLedgerPath,
  recordHybridLedgerEntry
} from "../hybrid-intelligence-conversion";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const refusedObservation: AnalogObservation = {
  observationId: "analog-refused-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "human_observation",
  summary: "Observed event without approval.",
  humanPresent: true,
  humanApprovedForConversion: false
};

const refusedDecision = evaluateHILObservation(refusedObservation);
assert(refusedDecision.status === "HIL_REFUSED", "HIL refuses analog observation without human approval");
assert(refusedDecision.allowedForward === false, "HIL refusal blocks forward movement");

const refusedConversion = convertHILApprovedObservation(refusedObservation, refusedDecision);
assert(refusedConversion.status === "HIC_REFUSED", "HIC refuses conversion without HIL approval");
assert(refusedConversion.downstreamEligibility === "held_for_review", "Unapproved analog input is held for review");

const approvedObservation: AnalogObservation = {
  observationId: "analog-approved-001",
  capturedAt: new Date().toISOString(),
  capturedBy: "human-operator",
  realitySource: "physical_document",
  summary: "User provided a physical document and approved conversion into a captured signal.",
  rawReference: "physical-document-reference",
  humanPresent: true,
  humanApprovedForConversion: true
};

const approvedDecision = evaluateHILObservation(approvedObservation);
assert(approvedDecision.status === "HIL_APPROVED", "HIL approves complete analog observation");
assert(approvedDecision.authorityBoundary.realityFirst === true, "HIL preserves reality-first boundary");

const approvedConversion = convertHILApprovedObservation(approvedObservation, approvedDecision);
assert(approvedConversion.status === "HIC_CONVERTED", "HIC converts HIL-approved observation");
assert(approvedConversion.authorityBoundary.hicBelowHil === true, "HIC remains below HIL");
assert(approvedConversion.authorityBoundary.conversionIsNotTruth === true, "HIC conversion is not truth");
assert(approvedConversion.downstreamEligibility === "eligible_for_aios", "Approved conversion may move to AIOS");

const ledgerEntry = recordHybridLedgerEntry(approvedObservation, approvedDecision, approvedConversion);
assert(ledgerEntry.chain === "Reality -> HIL -> HIC -> AIOS", "Hybrid ledger preserves correct chain");
assert(ledgerEntry.status === "recorded", "Hybrid ledger records approved conversion");
assert(getHybridLedgerPath().includes("hic-ledger.jsonl"), "Hybrid ledger path is available");

console.log("");
console.log("HIC_1_ANALOG_HYBRID_FOUNDATION_SMOKE=PASS");









