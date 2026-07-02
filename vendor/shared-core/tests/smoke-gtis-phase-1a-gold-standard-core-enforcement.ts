import {
  evaluateMemoryBoundary,
  MEMORY_BOUNDARY_DOCTRINE
} from "../memory-boundary";
import type {
  FinancialMemoryProjection
} from "../memory-boundary";
import {
  buildFundTrackerReverificationRequest,
  evaluateActivatedTransactionStateArtifactGate
} from "../fundtracker-gtis-integration";
import type {
  GTISReviewPacketSummary
} from "../fundtracker-gtis-integration";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const reviewPacket: GTISReviewPacketSummary = {
  status: "GTIS_LAUNCH_CANDIDATE_REVIEW_READY",
  finalLaunchCandidateStatus: "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY",
  scopedCompile: "PASS",
  smoke: "PASS",
  launchRequiresHumanAcceptance: true
};

const permittedProjection: FinancialMemoryProjection = {
  activatedTransactionStateId: "ats_phase1a_001",
  ledgerSafeSummary: {
    summaryId: "summary_phase1a_001",
    transactionRef: "txn_phase1a_001",
    merchantContinuityRef: "merchant_001",
    amountBand: "100-250",
    status: "activated",
    narrative: "Permitted ledger-safe financial memory projection."
  },
  merchantContinuityRef: "merchant_001",
  custodyClass: "MEMORY_SAFE",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "USER_CONTAINER",
  userContainerScope: "user_container_001",
  downstreamConsumerPermissions: ["SoulBaseAI"]
};

assert(MEMORY_BOUNDARY_DOCTRINE.boundary.soulBaseAIReceivesOnlyPermittedMemoryProjection === true, "Doctrine locks SoulBaseAI to permitted projections");
assert(MEMORY_BOUNDARY_DOCTRINE.boundary.soulVaultRetainsRawSourceCustody === true, "Doctrine locks SoulVault raw custody");
assert(MEMORY_BOUNDARY_DOCTRINE.boundary.rawFinancialDataCannotCrossToSoulBaseAI === true, "Doctrine blocks raw data crossing to SoulBaseAI");

const permitted = evaluateMemoryBoundary({
  transactionRef: "txn_phase1a_001",
  sourceSystem: "FundTrackerAI",
  intendedConsumer: "SoulBaseAI",
  projection: permittedProjection,
  custodyClass: "MEMORY_SAFE",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "USER_CONTAINER",
  userContainerScope: "user_container_001",
  downstreamConsumerPermissions: ["SoulBaseAI"],
  rawFlags: {}
});

assert(permitted.status === "MEMORY_PROJECTION_PERMITTED", "Permitted projection reaches SoulBaseAI");
assert(permitted.permittedProjection?.ledgerSafeSummary.summaryId === "summary_phase1a_001", "Permitted projection preserved");
assert(permitted.boundary.soulBaseAIReceivesOnlyPermittedProjection === true, "SoulBaseAI projection boundary preserved");
assert(permitted.boundary.rawFinancialDataCannotCrossToSoulBaseAI === true, "Raw data cannot cross boundary");

const rawBankBlocked = evaluateMemoryBoundary({
  transactionRef: "txn_phase1a_raw_bank",
  sourceSystem: "FundTrackerAI",
  intendedConsumer: "SoulBaseAI",
  custodyClass: "RAW_FINANCIAL_SOURCE",
  redactionLevel: "NONE",
  retentionRule: "LEGAL_HOLD",
  userContainerScope: "user_container_001",
  downstreamConsumerPermissions: ["SoulBaseAI"],
  rawFlags: {
    hasRawBankStatement: true,
    hasFullAccountNumber: true
  }
});

assert(rawBankBlocked.status === "CUSTODY_REDIRECT_REQUIRED", "Raw bank source redirects to custody");
assert(rawBankBlocked.custodyRedirectTarget === "SoulVault", "Raw source redirects to SoulVault");
assert(rawBankBlocked.refusalReasons.includes("RAW_BANK_STATEMENT_REFUSED"), "Raw bank statement refused");
assert(rawBankBlocked.refusalReasons.includes("FULL_ACCOUNT_NUMBER_REFUSED"), "Full account number refused");
assert(rawBankBlocked.refusalReasons.includes("SOULBASEAI_RAW_SOURCE_REFUSED"), "SoulBaseAI raw source refused");
assert(rawBankBlocked.refusalReasons.includes("SOULVAULT_REQUIRED_FOR_RAW_SOURCE"), "SoulVault required for raw source");

const legalEvidenceBlocked = evaluateMemoryBoundary({
  transactionRef: "txn_phase1a_legal",
  sourceSystem: "LawAidAI",
  intendedConsumer: "SoulBaseAI",
  custodyClass: "LEGAL_EVIDENCE",
  redactionLevel: "FULL",
  retentionRule: "LEGAL_HOLD",
  userContainerScope: "user_container_legal",
  downstreamConsumerPermissions: ["SoulBaseAI"],
  rawFlags: {
    hasLegalEvidenceFile: true,
    hasPrivateSourceDocument: true
  }
});

assert(legalEvidenceBlocked.status === "CUSTODY_REDIRECT_REQUIRED", "Legal evidence redirects to custody");
assert(legalEvidenceBlocked.refusalReasons.includes("LEGAL_EVIDENCE_FILE_REFUSED"), "Legal evidence file refused");
assert(legalEvidenceBlocked.refusalReasons.includes("PRIVATE_SOURCE_DOCUMENT_REFUSED"), "Private source document refused");

const missingMetadata = evaluateMemoryBoundary({
  transactionRef: "txn_phase1a_missing",
  sourceSystem: "GTIS",
  intendedConsumer: "SoulBaseAI",
  rawFlags: {}
});

assert(missingMetadata.status === "MEMORY_PROJECTION_REFUSED", "Missing metadata refuses memory projection");
assert(missingMetadata.refusalReasons.includes("CUSTODY_CLASS_REQUIRED"), "Custody class required");
assert(missingMetadata.refusalReasons.includes("REDACTION_LEVEL_REQUIRED"), "Redaction level required");
assert(missingMetadata.refusalReasons.includes("RETENTION_RULE_REQUIRED"), "Retention rule required");
assert(missingMetadata.refusalReasons.includes("USER_CONTAINER_SCOPE_REQUIRED"), "User container scope required");
assert(missingMetadata.refusalReasons.includes("DOWNSTREAM_PERMISSION_REQUIRED"), "Downstream permission required");

const reverificationClean = buildFundTrackerReverificationRequest({
  transactionRef: "txn_phase1a_reverify",
  verifiedOpportunityRef: "verified_opp_phase1a",
  fundTrackerDecisionRef: "ft_decision_phase1a",
  consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
  reviewReceiptRef: "review_receipt_phase1a",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: reviewPacket,
  humanAcceptanceRecorded: true,
  attemptedWriteToFundTracker: false
});

assert(reverificationClean.readyToRequestFundTrackerReview === true, "Reverification adapter clean request ready");
assert(reverificationClean.boundary.adapterIsReadAndRequestOnly === true, "Reverification adapter read-and-request only");
assert(reverificationClean.boundary.adapterDoesNotWriteFundTrackerState === true, "Reverification adapter does not write FundTrackerAI state");

const reverificationWriteAttempt = buildFundTrackerReverificationRequest({
  transactionRef: "txn_phase1a_write_attempt",
  verifiedOpportunityRef: "verified_opp_write",
  fundTrackerDecisionRef: "ft_decision_write",
  consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: reviewPacket,
  humanAcceptanceRecorded: true,
  attemptedWriteToFundTracker: true
});

assert(reverificationWriteAttempt.readyToRequestFundTrackerReview === false, "GTIS write attempt blocked");
assert(reverificationWriteAttempt.refusalReasons.includes("GTIS_CANNOT_WRITE_FUNDTRACKER_STATE"), "GTIS write to FundTrackerAI refused");

const atsVerified = evaluateActivatedTransactionStateArtifactGate({
  transactionRef: "txn_phase1a_ats",
  actor: "FUNDTRACKER_AI",
  verifiedCommitment: true,
  verifiedOpportunityRef: "verified_opp_ats",
  fundTrackerDecisionRef: "ft_decision_ats",
  fundTrackerEmittedActivatedTransactionStateRef: "ats_fundtracker_phase1a",
  proofHealthClean: true,
  activeRefusals: []
});

assert(atsVerified.status === "ATS_ARTIFACT_VERIFIED", "ATS artifact verified");
assert(atsVerified.activatedTransactionStateRef === "ats_fundtracker_phase1a", "FundTrackerAI ATS artifact ref preserved");
assert(atsVerified.boundary.gateVerifiesArtifactOnly === true, "ATS gate verifies artifact only");
assert(atsVerified.boundary.gateDoesNotGenerateActivatedTransactionState === true, "ATS gate does not generate ATS");
assert(atsVerified.boundary.gateDoesNotCreateRuntimeActivation === true, "ATS gate creates no runtime activation");

const atsFake = evaluateActivatedTransactionStateArtifactGate({
  transactionRef: "txn_phase1a_fake_ats",
  actor: "GTIS",
  verifiedCommitment: true,
  verifiedOpportunityRef: "verified_opp_fake_ats",
  fundTrackerDecisionRef: "ft_decision_fake_ats",
  fundTrackerEmittedActivatedTransactionStateRef: "ats_fake_gtis",
  proofHealthClean: true,
  activeRefusals: []
});

assert(atsFake.status === "ATS_ARTIFACT_BLOCKED", "Fake ATS blocked");
assert(atsFake.refusalReasons.includes("ATS_ARTIFACT_MUST_BE_EMITTED_BY_FUNDTRACKER"), "ATS must be emitted by FundTrackerAI");

const allBoundariesHold =
  permitted.boundary.memoryBoundaryIsNotPaymentAuthority === true &&
  reverificationClean.boundary.adapterIsNotPaymentAuthority === true &&
  atsVerified.boundary.gateIsNotPaymentAuthority === true &&
  permitted.boundary.memoryBoundaryIsNotTransactionTruth === true &&
  reverificationClean.boundary.adapterIsNotTransactionTruth === true &&
  atsVerified.boundary.gateIsNotTransactionTruth === true &&
  permitted.boundary.memoryBoundaryIsNotRuntimeActivation === true &&
  reverificationClean.boundary.adapterIsNotRuntimeActivation === true &&
  atsVerified.boundary.gateDoesNotCreateRuntimeActivation === true;

assert(allBoundariesHold === true, "Memory, reverification, and ATS boundaries all preserve non-authority state");

console.log("");
console.log("GTIS_PHASE_1A_GOLD_STANDARD_CORE_ENFORCEMENT_SMOKE=PASS");
