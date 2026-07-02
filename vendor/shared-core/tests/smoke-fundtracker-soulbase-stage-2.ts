import { evaluateStage2Readiness } from "../memory-boundary";
import {
  STAGE_2_POLICY,
  evaluateFundTrackerToSoulBaseProjection
} from "../fundtracker-soulbase-contract";
import type {
  ActivatedTransactionStateLite,
  FinancialMemoryProjectionRequest
} from "../fundtracker-soulbase-contract";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const activatedState: ActivatedTransactionStateLite = {
  activatedTransactionStateId: "ats_stage2_001",
  status: "ACTIVATED",
  sourceAuthority: "FundTrackerAI",
  transactionProofRef: "proof_ref_001",
  verifiedCommitment: true,
  entitlementState: "ENTITLED",
  amountMinor: 12500,
  currency: "USD",
  merchantContinuityRef: "merchant_ref_001",
  createdAt: "2026-04-28T00:00:00.000Z"
};

const baseRequest: FinancialMemoryProjectionRequest = {
  requestId: "stage2_request_001",
  stage2ExplicitlyAuthorized: true,
  activatedTransactionState: activatedState,
  custodyClass: "LEDGER_SAFE_SUMMARY",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "CONTAINER_BOUND",
  authorization: {
    userContainerAuthorized: true,
    downstreamConsumerPermission: true,
    retentionApproved: true,
    redactionConfirmed: true
  },
  ledgerSafeSummary: "User made a verified payment commitment. Summary is redacted and ledger-safe.",
  continuityPattern: "Verified payment commitment may support future continuity recall without exposing source data.",
  userContainerScope: "user_container_001",
  downstreamConsumerId: "SoulBaseAI",
  containsRawProcessorObject: false,
  containsRawBankStatement: false,
  containsFullAccountNumber: false,
  containsUnredactedPaymentMethod: false,
  containsPrivateSourceDocument: false,
  containsLegalEvidenceFile: false,
  containsUnrestrictedFinancialHistory: false,
  processorEventTreatedAsTruth: false
};

assert(STAGE_2_POLICY.artifactType === "FundTrackerAIToSoulBaseMemoryProjection", "Stage 2 artifact type locked");
assert(STAGE_2_POLICY.boundary.paymentEventIsNotCommitmentTruth === true, "Payment event is not commitment truth");
assert(STAGE_2_POLICY.boundary.commitmentTruthRequiresFundTrackerAI === true, "Commitment truth requires FundTrackerAI");

const readiness = evaluateStage2Readiness({
  gap1SoulBaseAuthoritySealed: true,
  gap2CustodyTaxonomyReady: true,
  gap3BoundaryEnforcementReady: true,
  gap4SoulMemoryGovernanceReady: true,
  stage2ContractExplicitlyAuthorized: true
});

assert(readiness.status === "STAGE_2_READY_FOR_CONTRACT_DESIGN", "Stage 2 readiness gate passes with authorization");
assert(readiness.canOpenStage2ContractDesign === true, "Stage 2 contract design authorized");

const happy = evaluateFundTrackerToSoulBaseProjection(baseRequest);

assert(happy.status === "FUNDTRACKER_SOULBASE_PROJECTION_READY", "Happy path projection ready");
assert(happy.decision === "EMIT_MEMORY_PROJECTION", "Happy path emits memory projection");
assert(happy.canEmitProjection === true, "Happy path can emit projection");
assert(happy.projection !== undefined, "Happy path projection exists");
assert(happy.projection?.artifactType === "FundTrackerAIToSoulBaseMemoryProjection", "Projection artifact type correct");
assert(happy.projection?.sourceAuthority === "FundTrackerAI", "Projection source authority is FundTrackerAI");
assert(happy.projection?.destination === "SoulBaseAI", "Projection destination is SoulBaseAI");
assert(happy.projection?.custodyClass === "LEDGER_SAFE_SUMMARY", "Projection custody class is ledger-safe summary");
assert(happy.projection?.boundary.projectionIsNotTransactionTruth === true, "Projection is not transaction truth");
assert(happy.projection?.boundary.projectionIsNotPaymentAuthority === true, "Projection is not payment authority");
assert(happy.projection?.boundary.projectionIsNotCustodyTransfer === true, "Projection is not custody transfer");
assert(happy.boundary.fundTrackerAIRemainsTransactionTruth === true, "FundTrackerAI remains transaction truth");
assert(happy.boundary.soulBaseAIIsNotFinancialTruth === true, "SoulBaseAI is not financial truth");

const noAuthorization = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_no_auth",
  stage2ExplicitlyAuthorized: false
});

assert(noAuthorization.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "No authorization blocks projection");
assert(noAuthorization.refusalReasons.includes("STAGE_2_NOT_EXPLICITLY_AUTHORIZED"), "Stage 2 authorization refusal present");

const rawProcessor = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_processor",
  custodyClass: "RAW_PROCESSOR_OBJECT",
  redactionLevel: "SOURCE_LOCKED",
  retentionRule: "DO_NOT_PERSIST",
  containsRawProcessorObject: true
});

assert(rawProcessor.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Raw processor object blocks projection");
assert(rawProcessor.decision === "REFUSE_PROJECTION", "Raw processor object refused");
assert(rawProcessor.refusalReasons.includes("RAW_PROCESSOR_OBJECT_CANNOT_CROSS"), "Raw processor object refusal present");

const processorAsTruth = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_processor_truth",
  processorEventTreatedAsTruth: true
});

assert(processorAsTruth.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Processor event as truth blocks projection");
assert(
  processorAsTruth.refusalReasons.includes("PROCESSOR_EVENT_CANNOT_BE_TREATED_AS_TRUTH"),
  "Processor event truth refusal present"
);

const rawBank = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_raw_bank",
  custodyClass: "RAW_FINANCIAL_SOURCE",
  redactionLevel: "SOURCE_LOCKED",
  retentionRule: "SOURCE_CUSTODY_ONLY",
  containsRawBankStatement: true
});

assert(rawBank.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Raw bank statement blocks projection");
assert(rawBank.decision === "REQUIRE_SOULVAULT_CUSTODY", "Raw bank statement requires SoulVault? custody");
assert(rawBank.refusalReasons.includes("RAW_BANK_STATEMENT_CANNOT_CROSS"), "Raw bank statement refusal present");

const fullAccount = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_full_account",
  containsFullAccountNumber: true
});

assert(fullAccount.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Full account number blocks projection");
assert(fullAccount.refusalReasons.includes("FULL_ACCOUNT_NUMBER_CANNOT_CROSS"), "Full account number refusal present");

const unredactedPayment = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_unredacted_payment",
  containsUnredactedPaymentMethod: true
});

assert(unredactedPayment.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Unredacted payment method blocks projection");
assert(unredactedPayment.refusalReasons.includes("UNREDACTED_PAYMENT_METHOD_CANNOT_CROSS"), "Unredacted payment refusal present");

const legalEvidence = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_legal_evidence",
  custodyClass: "LEGAL_EVIDENCE_FILE",
  redactionLevel: "SOURCE_LOCKED",
  retentionRule: "SOURCE_CUSTODY_ONLY",
  containsLegalEvidenceFile: true
});

assert(legalEvidence.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Legal evidence file blocks projection");
assert(legalEvidence.decision === "REQUIRE_SOULVAULT_CUSTODY", "Legal evidence requires SoulVault? custody");

const unrestrictedHistory = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_unrestricted_history",
  custodyClass: "UNRESTRICTED_FINANCIAL_HISTORY",
  redactionLevel: "SOURCE_LOCKED",
  retentionRule: "DO_NOT_PERSIST",
  containsUnrestrictedFinancialHistory: true
});

assert(unrestrictedHistory.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Unrestricted financial history blocks projection");
assert(
  unrestrictedHistory.refusalReasons.includes("UNRESTRICTED_FINANCIAL_HISTORY_CANNOT_CROSS"),
  "Unrestricted financial history refusal present"
);

const missingCustody = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_missing_custody",
  custodyClass: undefined
});

assert(missingCustody.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Missing custody class blocks projection");
assert(missingCustody.refusalReasons.includes("CUSTODY_CLASS_REQUIRED"), "Missing custody class refusal present");

const missingRetention = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_missing_retention",
  retentionRule: undefined
});

assert(missingRetention.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Missing retention rule blocks projection");
assert(missingRetention.refusalReasons.includes("RETENTION_RULE_REQUIRED"), "Missing retention rule refusal present");

const unauthorizedProjection = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_unauthorized_projection",
  authorization: {
    userContainerAuthorized: false,
    downstreamConsumerPermission: true,
    retentionApproved: true,
    redactionConfirmed: true
  }
});

assert(unauthorizedProjection.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Unauthorized projection blocks");
assert(unauthorizedProjection.refusalReasons.includes("AUTHORIZATION_INCOMPLETE"), "Authorization incomplete refusal present");

const notActivated = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_not_activated",
  activatedTransactionState: {
    ...activatedState,
    status: "PENDING"
  }
});

assert(notActivated.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Non-activated transaction state blocks projection");
assert(notActivated.refusalReasons.includes("ACTIVATED_TRANSACTION_STATE_REQUIRED"), "Activated state required refusal present");

const notVerified = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_not_verified",
  activatedTransactionState: {
    ...activatedState,
    verifiedCommitment: false
  }
});

assert(notVerified.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Unverified commitment blocks projection");
assert(notVerified.refusalReasons.includes("VERIFIED_COMMITMENT_REQUIRED"), "Verified commitment refusal present");

const notEntitled = evaluateFundTrackerToSoulBaseProjection({
  ...baseRequest,
  requestId: "stage2_request_not_entitled",
  activatedTransactionState: {
    ...activatedState,
    entitlementState: "PENDING_REVIEW"
  }
});

assert(notEntitled.status === "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED", "Non-entitled state blocks projection");
assert(notEntitled.refusalReasons.includes("ENTITLEMENT_STATE_MUST_BE_ENTITLED"), "Entitlement refusal present");

assert(happy.authorityTrace.custodyBoundaryPassed === true, "Custody boundary passed on happy path");
assert(happy.authorityTrace.soulMemoryGovernancePassed === true, "SoulMemory governance passed on happy path");
assert(happy.authorityTrace.processorEventRejectedAsTruth === true, "Processor event rejected as truth on happy path");
assert(happy.boundary.stage2ContractIsProjectionOnly === true, "Stage 2 contract is projection only");

console.log("");
console.log("STAGE_2_FUNDTRACKER_SOULBASE_CONTRACT_SMOKE=PASS");







