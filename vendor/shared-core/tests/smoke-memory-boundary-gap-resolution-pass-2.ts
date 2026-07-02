import {
  SOULBASEAI_AUTHORITY,
  evaluateSoulMemoryGovernance,
  evaluateStage2Readiness,
  enforceSoulVaultSoulBaseBoundary
} from "../memory-boundary";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(SOULBASEAI_AUTHORITY.name === "SoulBaseAI", "SoulBaseAI name has no suffix");
assert(SOULBASEAI_AUTHORITY.status === "SOULBASEAI_AUTHORITY_SEALED", "SoulBaseAI authority sealed");
assert(SOULBASEAI_AUTHORITY.boundary.isNotTransactionTruth === true, "SoulBaseAI is not transaction truth");
assert(SOULBASEAI_AUTHORITY.boundary.isNotPaymentAuthority === true, "SoulBaseAI is not payment authority");
assert(SOULBASEAI_AUTHORITY.boundary.isNotCustodyPlane === true, "SoulBaseAI is not custody plane");
assert(SOULBASEAI_AUTHORITY.boundary.isNotFundTrackerAIOverride === true, "SoulBaseAI does not override FundTrackerAI");

const governedMemory = evaluateSoulMemoryGovernance({
  projectionId: "projection_ledger_safe_001",
  projectionLabel: "Ledger-safe authorized memory projection",
  isDerived: true,
  isRedacted: true,
  isRetentionBounded: true,
  hasUserContainerScope: true,
  hasDownstreamConsumerPermission: true,
  containsRawSourceData: false,
  containsRawFinancialSource: false,
  containsLegalEvidenceFile: false,
  containsProcessorObject: false
});

assert(governedMemory.status === "SOULMEMORY_GOVERNS_SOULBASEAI_READY", "SoulMemory governance allows valid projection");
assert(governedMemory.decision === "ALLOW_MEMORY_PROJECTION", "Valid memory projection allowed");
assert(governedMemory.canPersistToSoulBaseAI === true, "Valid projection can persist to SoulBaseAI");

const rawFinancialMemory = evaluateSoulMemoryGovernance({
  projectionId: "projection_raw_financial_001",
  projectionLabel: "Raw financial source attempt",
  isDerived: false,
  isRedacted: false,
  isRetentionBounded: false,
  hasUserContainerScope: true,
  hasDownstreamConsumerPermission: true,
  containsRawSourceData: false,
  containsRawFinancialSource: true,
  containsLegalEvidenceFile: false,
  containsProcessorObject: false
});

assert(rawFinancialMemory.status === "SOULMEMORY_GOVERNS_SOULBASEAI_BLOCKED", "Raw financial source blocked by SoulMemory governance");
assert(rawFinancialMemory.decision === "REQUIRE_SOULVAULT_CUSTODY", "Raw financial source requires SoulVault? custody");
assert(rawFinancialMemory.requiresSoulVaultCustody === true, "SoulVault? custody required");
assert(
  rawFinancialMemory.refusalReasons.includes("RAW_FINANCIAL_SOURCE_REQUIRES_CUSTODY"),
  "Raw financial custody refusal present"
);

const processorMemory = evaluateSoulMemoryGovernance({
  projectionId: "projection_processor_001",
  projectionLabel: "Processor object attempt",
  isDerived: false,
  isRedacted: false,
  isRetentionBounded: false,
  hasUserContainerScope: true,
  hasDownstreamConsumerPermission: true,
  containsRawSourceData: false,
  containsRawFinancialSource: false,
  containsLegalEvidenceFile: false,
  containsProcessorObject: true
});

assert(processorMemory.decision === "REFUSE_PERSISTENCE", "Processor object persistence refused");
assert(
  processorMemory.refusalReasons.includes("PROCESSOR_OBJECT_CANNOT_PERSIST_AS_MEMORY"),
  "Processor object cannot persist as memory"
);

const custodyAllowed = enforceSoulVaultSoulBaseBoundary({
  candidateId: "candidate_stage2_ready_ledger_safe",
  label: "Ledger-safe summary",
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

assert(custodyAllowed.status === "MEMORY_PROJECTION_ALLOWED", "Custody taxonomy still allows ledger-safe summary");
assert(custodyAllowed.canPersistToSoulBaseAI === true, "Boundary enforcement still allows valid memory projection");

const blockedReadiness = evaluateStage2Readiness({
  gap1SoulBaseAuthoritySealed: true,
  gap2CustodyTaxonomyReady: true,
  gap3BoundaryEnforcementReady: true,
  gap4SoulMemoryGovernanceReady: true,
  stage2ContractExplicitlyAuthorized: false
});

assert(blockedReadiness.status === "STAGE_2_BLOCKED", "Stage 2 remains blocked without explicit authorization");
assert(
  blockedReadiness.blockedReasons.includes("STAGE_2_CONTRACT_NOT_EXPLICITLY_AUTHORIZED"),
  "Explicit authorization block present"
);

const ready = evaluateStage2Readiness({
  gap1SoulBaseAuthoritySealed: true,
  gap2CustodyTaxonomyReady: true,
  gap3BoundaryEnforcementReady: true,
  gap4SoulMemoryGovernanceReady: true,
  stage2ContractExplicitlyAuthorized: true
});

assert(ready.status === "STAGE_2_READY_FOR_CONTRACT_DESIGN", "Stage 2 readiness gate can pass after authorization");
assert(ready.canOpenStage2ContractDesign === true, "Stage 2 contract design can open after authorization");
assert(ready.boundary.readinessIsNotContract === true, "Readiness is not contract");
assert(ready.boundary.readinessIsNotPaymentAuthority === true, "Readiness is not payment authority");
assert(ready.boundary.readinessIsNotCustodyTransfer === true, "Readiness is not custody transfer");

console.log("");
console.log("MEMORY_BOUNDARY_GAP_RESOLUTION_PASS_2_SMOKE=PASS");








