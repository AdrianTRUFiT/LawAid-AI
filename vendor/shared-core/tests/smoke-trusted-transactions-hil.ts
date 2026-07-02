import assert from "node:assert/strict";
import {
  FORBIDDEN_DIRECT_RATE_ARTIFACTS,
  TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY,
  evaluateHilRefusals,
  hasRefusal,
} from "../trusted-transactions";
import {
  createValidSimulationInput,
  runTrustedTransactionSimulation,
} from "../trusted-transactions-simulator";

const nowIso = new Date().toISOString();

const validInput = createValidSimulationInput(nowIso);
const valid = runTrustedTransactionSimulation("valid-trusted-transaction-simulation", validInput);

assert.equal(valid.hilPassed, true);
assert.equal(valid.refusals.length, 0);
assert.equal(valid.rvrReceipt?.receiptStatus, "RVR_COMPLETE");
assert.equal(valid.rvrReceipt?.displayCreatesTruth, false);
assert.equal(valid.trustedTransactionRecord?.finalState, "RECORDED");
assert.equal(valid.trustedTransactionRecord?.createdFromRailSuccessOnly, false);
assert.equal(valid.proofLine, "HIL PASSED — CONSEQUENCE ONLY AFTER VERIFIED STATE");

assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.paiSafeCreatesTruth, false);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.trufitPaymentSolutionsCreatesTruth, false);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.micCarriesCustody, false);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.miSealsTruth, false);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.wfcCreatesTruth, false);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.tisSealsFinancialTruth, false);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.fundTrackerSealsFinancialTruth, true);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.fintechionAiObservesOnly, true);
assert.equal(TRUSTED_TRANSACTION_AUTHORITY_BOUNDARY.beeatsExplainsOnly, true);

const missingMicInput = { ...validInput, mic: undefined };
const missingMic = evaluateHilRefusals(missingMicInput);
assert.equal(hasRefusal(missingMic, "MISSING_MIC"), true);

const expiredRouteInput = {
  ...validInput,
  miPlan: {
    ...validInput.miPlan,
    expiresAt: new Date(Date.parse(nowIso) - 1000).toISOString(),
  },
};
const expiredRoute = evaluateHilRefusals(expiredRouteInput);
assert.equal(hasRefusal(expiredRoute, "EXPIRED_ROUTE"), true);

const replayInput = { ...validInput, replayAttempt: true };
const replay = evaluateHilRefusals(replayInput);
assert.equal(hasRefusal(replay, "REPLAY_ATTEMPT"), true);

const processorWithoutTruthInput = {
  ...validInput,
  fundTrackerSeal: undefined,
  processorSucceeded: true,
  railSucceeded: false,
  attemptedConsequence: true,
};
const processorWithoutTruth = evaluateHilRefusals(processorWithoutTruthInput);
assert.equal(hasRefusal(processorWithoutTruth, "PROCESSOR_SUCCESS_WITHOUT_VERIFIED_STATE"), true);
assert.equal(hasRefusal(processorWithoutTruth, "UNAUTHORIZED_CONSEQUENCE"), true);

const railWithoutTruthInput = {
  ...validInput,
  fundTrackerSeal: undefined,
  processorSucceeded: false,
  railSucceeded: true,
};
const railWithoutTruth = evaluateHilRefusals(railWithoutTruthInput);
assert.equal(hasRefusal(railWithoutTruth, "RAIL_SUCCESS_WITHOUT_TRUTH"), true);

const transportWithoutTruthInput = {
  ...validInput,
  fundTrackerSeal: undefined,
  transport: {
    ...validInput.transport,
    finalTransportStatus: "COMPLETED" as const,
  },
};
const transportWithoutTruth = evaluateHilRefusals(transportWithoutTruthInput);
assert.equal(hasRefusal(transportWithoutTruth, "TRANSPORT_COMPLETE_WITHOUT_TRUTH_SEAL"), true);

const receiptBeforeRecordInput = {
  ...validInput,
  fundTrackerSeal: undefined,
  soulRegistry: undefined,
  attemptedReceipt: true,
};
const receiptBeforeRecord = evaluateHilRefusals(receiptBeforeRecordInput);
assert.equal(hasRefusal(receiptBeforeRecord, "RECEIPT_ATTEMPT_BEFORE_RECORD"), true);

const tisApprovedWithoutFundTrackerInput = {
  ...validInput,
  fundTrackerSeal: undefined,
  tis: {
    ...validInput.tis,
    decision: "APPROVED" as const,
  },
};
const tisApprovedWithoutFundTracker = evaluateHilRefusals(tisApprovedWithoutFundTrackerInput);
assert.equal(hasRefusal(tisApprovedWithoutFundTracker, "TIS_APPROVED_BUT_FUNDTRACKER_NOT_SEALED"), true);

const mismatchedProofInput = {
  ...validInput,
  soulRegistry: {
    ...validInput.soulRegistry,
    trustedTransactionId: "different-transaction",
  },
};
const mismatchedProof = evaluateHilRefusals(mismatchedProofInput);
assert.equal(hasRefusal(mismatchedProof, "MISMATCHED_PROOF_RECORD"), true);

const blockedSimulation = runTrustedTransactionSimulation("rail-success-without-truth-refusal", railWithoutTruthInput);
assert.equal(blockedSimulation.hilPassed, false);
assert.equal(blockedSimulation.rvrReceipt, undefined);
assert.equal(blockedSimulation.trustedTransactionRecord, undefined);
assert.equal(blockedSimulation.proofLine, "HIL REFUSED — CONSEQUENCE BLOCKED UNTIL VERIFIED STATE EXISTS");

for (const artifact of FORBIDDEN_DIRECT_RATE_ARTIFACTS) {
  assert.equal(typeof artifact, "string");
}

console.log("TRUSTED TRANSACTIONS CONTRACTS CREATED");
console.log("TRUSTED TRANSACTIONS SIMULATOR CREATED");
console.log("VALID PATH PASSED");
console.log("MISSING MIC REFUSAL PASSED");
console.log("EXPIRED ROUTE REFUSAL PASSED");
console.log("REPLAY ATTEMPT REFUSAL PASSED");
console.log("PROCESSOR SUCCESS WITHOUT TRUTH REFUSAL PASSED");
console.log("RAIL SUCCESS WITHOUT TRUTH REFUSAL PASSED");
console.log("TRANSPORT COMPLETE WITHOUT TRUTH SEAL REFUSAL PASSED");
console.log("RECEIPT BEFORE RECORD REFUSAL PASSED");
console.log("TIS APPROVED BUT FUNDTRACKER NOT SEALED REFUSAL PASSED");
console.log("NO AUTHORITY DRIFT DETECTED");
console.log("HIL PASSED — CONSEQUENCE ONLY AFTER VERIFIED STATE");
