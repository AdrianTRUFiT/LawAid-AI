import {
  CUSTODY_CLASS_TAXONOMY,
  enforceSoulVaultSoulBaseBoundary,
  verifyThinkBaseSoulBaseBoundary
} from "../memory-boundary";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const boundary = verifyThinkBaseSoulBaseBoundary();

assert(boundary.status === "THINKBASE_SOULBASE_BOUNDARY_VERIFICATION_READY", "Prior boundary pass remains ready");
assert(boundary.stage2Blocked === true, "Stage 2 remains blocked pending remaining gap resolution");
assert(boundary.defaultCrossingPosture === "DENY", "Default posture remains DENY");

assert(CUSTODY_CLASS_TAXONOMY.length === 9, "Custody taxonomy has nine classes");

const ledgerSafe = enforceSoulVaultSoulBaseBoundary({
  candidateId: "candidate_ledger_safe_001",
  label: "Ledger-safe financial memory projection",
  custodyClass: "LEDGER_SAFE_SUMMARY",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "CONTAINER_BOUND",
  requestedDestination: "SOULBASE_AI",
  sourceSystem: "FundTrackerAI",
  authorization: {
    userContainerAuthorized: true,
    downstreamConsumerPermission: true,
    retentionApproved: true,
    redactionConfirmed: true
  }
});

assert(ledgerSafe.status === "MEMORY_PROJECTION_ALLOWED", "Ledger-safe summary may persist to SoulBaseAI");
assert(ledgerSafe.approvedDestination === "SOULBASE_AI", "Ledger-safe summary approved destination is SoulBaseAI");
assert(ledgerSafe.canPersistToSoulBaseAI === true, "Ledger-safe summary can persist to SoulBaseAI");

const rawBank = enforceSoulVaultSoulBaseBoundary({
  candidateId: "candidate_raw_bank_001",
  label: "Raw bank statement",
  custodyClass: "RAW_FINANCIAL_SOURCE",
  redactionLevel: "SOURCE_LOCKED",
  retentionRule: "SOURCE_CUSTODY_ONLY",
  requestedDestination: "SOULBASE_AI",
  sourceSystem: "ManualReview",
  authorization: {
    userContainerAuthorized: true,
    downstreamConsumerPermission: true,
    retentionApproved: true,
    redactionConfirmed: true
  }
});

assert(rawBank.status === "CUSTODY_REQUIRED", "Raw financial source requires custody");
assert(rawBank.approvedDestination === "SOULVAULT", "Raw financial source routes to SoulVault?");
assert(rawBank.canPersistToSoulBaseAI === false, "Raw financial source cannot persist to SoulBaseAI");
assert(
  rawBank.refusalReasons.includes("SOULBASE_AI_NOT_ALLOWED_FOR_CUSTODY_CLASS"),
  "Raw financial source refuses SoulBaseAI destination"
);

const processorObject = enforceSoulVaultSoulBaseBoundary({
  candidateId: "candidate_processor_001",
  label: "Raw processor event",
  custodyClass: "RAW_PROCESSOR_OBJECT",
  redactionLevel: "SOURCE_LOCKED",
  retentionRule: "DO_NOT_PERSIST",
  requestedDestination: "SOULBASE_AI",
  sourceSystem: "FundTrackerAI",
  authorization: {
    userContainerAuthorized: true,
    downstreamConsumerPermission: true,
    retentionApproved: true,
    redactionConfirmed: true
  }
});

assert(processorObject.status === "REFUSED_BY_DEFAULT_DENY", "Raw processor object refused by default deny");
assert(processorObject.approvedDestination === "REFUSE", "Raw processor object approved destination is REFUSE");
assert(
  processorObject.refusalReasons.includes("RAW_PROCESSOR_OBJECT_CANNOT_CROSS"),
  "Raw processor object crossing refusal exists"
);

const unauthorizedSummary = enforceSoulVaultSoulBaseBoundary({
  candidateId: "candidate_unauthorized_summary_001",
  label: "Unauthorized derived summary",
  custodyClass: "DERIVED_MEMORY_PROJECTION",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "USER_APPROVED_CONTINUITY",
  requestedDestination: "SOULBASE_AI",
  sourceSystem: "FundTrackerAI",
  authorization: {
    userContainerAuthorized: false,
    downstreamConsumerPermission: true,
    retentionApproved: true,
    redactionConfirmed: true
  }
});

assert(unauthorizedSummary.status === "REFUSED_BY_DEFAULT_DENY", "Unauthorized summary refused");
assert(
  unauthorizedSummary.refusalReasons.includes("AUTHORIZATION_INCOMPLETE"),
  "Authorization incomplete refusal exists"
);

assert(ledgerSafe.boundary.soulBaseAIIsNotTransactionTruth === true, "SoulBaseAI is not transaction truth");
assert(ledgerSafe.boundary.soulBaseAIIsNotPaymentAuthority === true, "SoulBaseAI is not payment authority");
assert(ledgerSafe.boundary.soulVaultOwnsPrivateSourceCustody === true, "SoulVault? owns private source custody");
assert(ledgerSafe.boundary.fundTrackerAIRemainsFinancialTruth === true, "FundTrackerAI remains financial truth");

console.log("");
console.log("MEMORY_BOUNDARY_GAP_RESOLUTION_PASS_1_SMOKE=PASS");









