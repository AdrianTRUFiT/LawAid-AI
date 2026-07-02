import type {
  LivePaymentAuthority,
  LiveRailAuthority,
  LiveTruthAuthority,
  RuntimeActivationAuthority,
  SandboxAuditSpineBinding,
  SandboxEvidenceLedgerRecord,
  SandboxReviewPacket,
  SandboxTrustSpineConsolidationResult
} from "../sandbox-trust-spine-consolidation";

const ledger: SandboxEvidenceLedgerRecord = {
  __brand: "SANDBOX_EVIDENCE_LEDGER_RECORD",
  ledgerRecordId: "ledger_compile",
  transactionRef: "compile_txn",
  status: "SANDBOX_EVIDENCE_LEDGER_READY",
  flowStatus: "SANDBOX_E2E_TRANSACTION_FLOW_READY",
  proofChain: {
    railPayloadRef: "rail",
    sandboxProcessorEventRef: "processor",
    verifiedOpportunityRef: "opportunity",
    fundTrackerDecisionRef: "decision",
    sandboxAtsRef: "ats",
    paiSafeContractId: "contract",
    paiSafeDisplayId: "display"
  },
  eventTrace: [],
  hash: "hash",
  prevHash: "GENESIS",
  refusalCodes: [],
  boundary: {
    ledgerIsSandboxOnly: true,
    ledgerCreatesNoLiveRails: true,
    ledgerCreatesNoLivePaymentProcessing: true,
    ledgerCreatesNoLiveTransactionTruth: true,
    ledgerCreatesNoLiveATS: true,
    ledgerCreatesNoCustodyTransfer: true,
    ledgerCreatesNoRuntimeActivation: true,
    ledgerIsEvidenceOnly: true
  }
};

void ledger;

// @ts-expect-error Ledger cannot become live rail authority.
const ledgerAsLiveRail: LiveRailAuthority = ledger;

void ledgerAsLiveRail;

// @ts-expect-error Ledger cannot become live payment authority.
const ledgerAsPayment: LivePaymentAuthority = ledger;

void ledgerAsPayment;

// @ts-expect-error Ledger cannot become live truth authority.
const ledgerAsTruth: LiveTruthAuthority = ledger;

void ledgerAsTruth;

// @ts-expect-error Ledger cannot create live rails.
ledger.boundary.ledgerCreatesNoLiveRails = false;

// @ts-expect-error Ledger cannot create runtime activation.
ledger.boundary.ledgerCreatesNoRuntimeActivation = false;

const audit: SandboxAuditSpineBinding = {
  __brand: "SANDBOX_AUDIT_SPINE_BINDING",
  auditBindingId: "audit_compile",
  transactionRef: "compile_txn",
  status: "SANDBOX_AUDIT_SPINE_BOUND",
  ledgerRecordId: "ledger_compile",
  proofCompleteness: {
    railPayloadRef: true,
    sandboxProcessorEventRef: true,
    verifiedOpportunityRef: true,
    fundTrackerDecisionRef: true,
    sandboxAtsRef: true,
    paiSafeContractId: true,
    paiSafeDisplayId: true
  },
  auditFindings: [],
  refusalCodes: [],
  boundary: {
    auditIsReadOnly: true,
    auditCreatesNoTransactionTruth: true,
    auditCreatesNoLiveCapability: true,
    auditDoesNotMutateLedger: true,
    auditDoesNotAuthorizeRuntime: true
  }
};

void audit;

// @ts-expect-error Audit binding cannot become runtime activation authority.
const auditAsRuntime: RuntimeActivationAuthority = audit;

void auditAsRuntime;

// @ts-expect-error Audit cannot mutate ledger.
audit.boundary.auditDoesNotMutateLedger = false;

// @ts-expect-error Audit cannot authorize runtime.
audit.boundary.auditDoesNotAuthorizeRuntime = false;

const review: SandboxReviewPacket = {
  __brand: "SANDBOX_REVIEW_PACKET",
  reviewPacketId: "review_compile",
  transactionRef: "compile_txn",
  status: "SANDBOX_REVIEW_PACKET_READY",
  summary: "Ready.",
  verifiedClaims: [],
  refusedClaims: [],
  ledgerRecordId: "ledger_compile",
  auditBindingId: "audit_compile",
  proofRefs: ledger.proofChain,
  boundary: {
    reviewIsHumanReadableOnly: true,
    reviewCreatesNoAuthority: true,
    reviewCreatesNoLiveRails: true,
    reviewCreatesNoPaymentProcessing: true,
    reviewCreatesNoRuntimeActivation: true,
    reviewDoesNotExceedVerifiedArtifacts: true
  }
};

void review;

// @ts-expect-error Review packet cannot become launch/runtime authority.
const reviewAsRuntime: RuntimeActivationAuthority = review;

void reviewAsRuntime;

// @ts-expect-error Review packet cannot create authority.
review.boundary.reviewCreatesNoAuthority = false;

// @ts-expect-error Review packet cannot create payment processing.
review.boundary.reviewCreatesNoPaymentProcessing = false;

const consolidation: SandboxTrustSpineConsolidationResult = {
  __brand: "SANDBOX_TRUST_SPINE_CONSOLIDATION_RESULT",
  consolidationId: "consolidation_compile",
  status: "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY",
  transactionRef: "compile_txn",
  e2eFlow: {
    __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
    flowId: "flow_compile",
    transactionRef: "compile_txn",
    status: "SANDBOX_E2E_TRANSACTION_FLOW_READY",
    refusalCodes: [],
    intake: {
      __brand: "SANDBOX_RAIL_ADAPTER_RESULT",
      status: "SANDBOX_RAIL_ADAPTER_REFUSED",
      refusalCodes: [],
      boundary: {
        adapterCreatesNoLiveRails: true,
        adapterCreatesNoLivePaymentProcessing: true,
        adapterCreatesNoTransactionTruth: true,
        adapterCreatesNoTransactionMutation: true,
        adapterCreatesNoATS: true,
        adapterCreatesNoCustodyTransfer: true,
        adapterCreatesNoRuntimeActivation: true,
        adapterIsIntakeOnly: true
      }
    },
    proofChain: ledger.proofChain,
    boundary: {
      sandboxOnly: true,
      e2eCreatesNoLiveRails: true,
      e2eCreatesNoLivePaymentProcessing: true,
      e2eCreatesNoLiveTransactionTruth: true,
      e2eCreatesNoLiveATS: true,
      e2eCreatesNoCustodyTransfer: true,
      e2eCreatesNoRuntimeActivation: true,
      fundTrackerAIIsOnlySandboxTruthAuthority: true,
      paiSafeIsDisplayOnly: true,
      uiIsDisplayOnly: true
    }
  },
  ledgerRecord: ledger,
  auditBinding: audit,
  reviewPacket: review,
  refusalCodes: [],
  boundary: {
    consolidationIsSandboxOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    evidenceLedgerIsNotAuthority: true,
    auditSpineIsReadOnly: true,
    reviewPacketIsNotLaunchApproval: true
  }
};

void consolidation;

// @ts-expect-error Consolidation cannot become live rail authority.
const consolidationAsLiveRail: LiveRailAuthority = consolidation;

void consolidationAsLiveRail;

// @ts-expect-error Consolidation cannot create runtime activation.
consolidation.boundary.noRuntimeActivationCreated = false;

// @ts-expect-error Review packet is not launch approval.
consolidation.boundary.reviewPacketIsNotLaunchApproval = false;
