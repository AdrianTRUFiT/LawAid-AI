import {
  bindSandboxAuditSpine,
  buildValidSandboxTrustSpinePayload,
  createSandboxEvidenceLedgerRecord,
  generateSandboxReviewPacket,
  runSandboxTrustSpineConsolidation,
  SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE,
  verifySandboxEvidenceLedgerChain
} from "../sandbox-trust-spine-consolidation";

import {
  buildValidSandboxE2EPayload,
  runSandboxEndToEndTransactionFlow
} from "../sandbox-e2e-transaction-flow-harness";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.evidenceLedgerIsNotAuthority === true, "Doctrine locks ledger as non-authority");
assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.auditSpineIsReadOnly === true, "Doctrine locks audit spine read-only");
assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.reviewPacketIsNotLaunchApproval === true, "Doctrine locks review packet as not launch approval");
assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no live payment processing");
assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.noLiveTransactionTruthCreated === true, "Doctrine creates no live truth");
assert(SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE.boundary.noRuntimeActivationCreated === true, "Doctrine creates no runtime activation");

const payload = buildValidSandboxTrustSpinePayload("trust_spine_txn_001");
const result = runSandboxTrustSpineConsolidation(payload);

assert(result.status === "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY", "Trust spine consolidation ready");
assert(result.e2eFlow.status === "SANDBOX_E2E_TRANSACTION_FLOW_READY", "E2E flow ready inside trust spine");
assert(result.ledgerRecord?.status === "SANDBOX_EVIDENCE_LEDGER_READY", "Evidence ledger ready");
assert(result.auditBinding?.status === "SANDBOX_AUDIT_SPINE_BOUND", "Audit spine bound");
assert(result.reviewPacket?.status === "SANDBOX_REVIEW_PACKET_READY", "Review packet ready");
assert(result.refusalCodes.length === 0, "No trust spine refusals");

assert(result.ledgerRecord?.proofChain.railPayloadRef === payload.eventRef, "Ledger preserves rail payload ref");
assert(typeof result.ledgerRecord?.proofChain.sandboxProcessorEventRef === "string", "Ledger preserves processor event ref");
assert(typeof result.ledgerRecord?.proofChain.verifiedOpportunityRef === "string", "Ledger preserves verified opportunity ref");
assert(typeof result.ledgerRecord?.proofChain.fundTrackerDecisionRef === "string", "Ledger preserves FundTracker decision ref");
assert(typeof result.ledgerRecord?.proofChain.sandboxAtsRef === "string", "Ledger preserves sandbox ATS ref");
assert(typeof result.ledgerRecord?.proofChain.paiSafeContractId === "string", "Ledger preserves PAI-SAFE contract id");
assert(typeof result.ledgerRecord?.proofChain.paiSafeDisplayId === "string", "Ledger preserves PAI-SAFE display id");

assert(result.ledgerRecord?.eventTrace.length === 6, "Ledger event trace has six steps");
assert(result.ledgerRecord?.eventTrace[0]?.step === "RAIL_INTAKE", "Ledger first step rail intake");
assert(result.ledgerRecord?.eventTrace[2]?.authority === "FundTrackerAI", "Ledger FundTrackerAI authority recorded");
assert(result.ledgerRecord?.eventTrace[4]?.authority === "PAI-SAFE", "Ledger PAI-SAFE display authority separated");
assert(result.ledgerRecord?.eventTrace.every((event) => event.createsLiveCapability === false) === true, "Ledger trace creates no live capability");

if (!result.ledgerRecord) throw new Error("ASSERTION_FAILED: Ledger record exists");

const chainCheck = verifySandboxEvidenceLedgerChain([result.ledgerRecord]);

assert(chainCheck.valid === true, "Single ledger hash chain valid");
assert(chainCheck.refusalCodes.length === 0, "Single ledger hash chain has no refusals");

const secondPayload = buildValidSandboxTrustSpinePayload("trust_spine_txn_002");
const secondFlow = runSandboxEndToEndTransactionFlow(secondPayload);
const secondLedger = createSandboxEvidenceLedgerRecord(secondFlow, result.ledgerRecord.hash);
const twoChainCheck = verifySandboxEvidenceLedgerChain([result.ledgerRecord, secondLedger]);

assert(secondLedger.prevHash === result.ledgerRecord.hash, "Second ledger links to first hash");
assert(twoChainCheck.valid === true, "Two-record ledger hash chain valid");

const tamperedLedger = {
  ...secondLedger,
  proofChain: {
    ...secondLedger.proofChain,
    paiSafeDisplayId: "tampered_display_id"
  }
};

const tamperedCheck = verifySandboxEvidenceLedgerChain([result.ledgerRecord, tamperedLedger]);

assert(tamperedCheck.valid === false, "Tampered ledger chain refused");
assert(tamperedCheck.refusalCodes.includes("LEDGER_HASH_CHAIN_BROKEN"), "Tampered ledger chain reports broken hash");

const livePayload = {
  ...buildValidSandboxTrustSpinePayload("trust_spine_live_refused"),
  provider: "STRIPE_LIVE" as const,
  sandboxOnly: false,
  liveRail: true,
  livePayment: true
};

const liveRefused = runSandboxTrustSpineConsolidation(livePayload);

assert(liveRefused.status === "SANDBOX_TRUST_SPINE_CONSOLIDATION_REFUSED", "Live payload trust spine refused");
assert(liveRefused.refusalCodes.includes("E2E_FLOW_NOT_READY"), "Live refused because E2E not ready");
assert(liveRefused.ledgerRecord?.status === "SANDBOX_EVIDENCE_LEDGER_REFUSED", "Live refused ledger refused");
assert(liveRefused.auditBinding?.status === "SANDBOX_AUDIT_SPINE_REFUSED", "Live refused audit refused");
assert(liveRefused.reviewPacket?.status === "SANDBOX_REVIEW_PACKET_BLOCKED", "Live refused review blocked");

const incompleteFlow = runSandboxEndToEndTransactionFlow(buildValidSandboxE2EPayload("trust_spine_missing_ref"));
const incompleteLedger = createSandboxEvidenceLedgerRecord({
  ...incompleteFlow,
  proofChain: {
    ...incompleteFlow.proofChain,
    paiSafeDisplayId: undefined
  }
});

assert(incompleteLedger.status === "SANDBOX_EVIDENCE_LEDGER_REFUSED", "Missing proof ref refuses ledger");
assert(incompleteLedger.refusalCodes.includes("MISSING_PAI_SAFE_DISPLAY_ID"), "Missing display id refusal recorded");

const incompleteAudit = bindSandboxAuditSpine(incompleteLedger);
assert(incompleteAudit.status === "SANDBOX_AUDIT_SPINE_REFUSED", "Incomplete ledger refuses audit spine");

const incompleteReview = generateSandboxReviewPacket(incompleteLedger, incompleteAudit);
assert(incompleteReview.status === "SANDBOX_REVIEW_PACKET_BLOCKED", "Incomplete audit blocks review packet");

const noLiveLeak =
  result.boundary.noLiveRailsCreated === true &&
  result.boundary.noLivePaymentProcessingCreated === true &&
  result.boundary.noLiveTransactionTruthCreated === true &&
  result.boundary.noLiveATSCreated === true &&
  result.boundary.noCustodyTransferCreated === true &&
  result.boundary.noRuntimeActivationCreated === true &&
  result.boundary.evidenceLedgerIsNotAuthority === true &&
  result.boundary.auditSpineIsReadOnly === true &&
  result.boundary.reviewPacketIsNotLaunchApproval === true;

assert(noLiveLeak === true, "No live capability leaked from trust spine consolidation");

console.log("");
console.log("SANDBOX_TRUST_SPINE_CONSOLIDATION_SMOKE=PASS");
