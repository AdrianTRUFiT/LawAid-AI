import {
  buildValidSandboxE2EPayload,
  runSandboxEndToEndTransactionFlow
} from "../sandbox-e2e-transaction-flow-harness";

import type {
  RawSandboxRailPayload
} from "../sandbox-rail-adapter-harness";

import type {
  SandboxEndToEndTransactionFlowResult
} from "../sandbox-e2e-transaction-flow-harness";

export type SandboxTrustSpineStatus =
  | "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY"
  | "SANDBOX_TRUST_SPINE_CONSOLIDATION_BLOCKED"
  | "SANDBOX_TRUST_SPINE_CONSOLIDATION_REFUSED";

export type SandboxEvidenceLedgerStatus =
  | "SANDBOX_EVIDENCE_LEDGER_READY"
  | "SANDBOX_EVIDENCE_LEDGER_REFUSED";

export type SandboxAuditSpineStatus =
  | "SANDBOX_AUDIT_SPINE_BOUND"
  | "SANDBOX_AUDIT_SPINE_REFUSED";

export type SandboxReviewPacketStatus =
  | "SANDBOX_REVIEW_PACKET_READY"
  | "SANDBOX_REVIEW_PACKET_BLOCKED";

export type RequiredSandboxProofChain = Required<SandboxEndToEndTransactionFlowResult["proofChain"]>;

export type SandboxTrustSpineRefusalCode =
  | "E2E_FLOW_NOT_READY"
  | "MISSING_RAIL_PAYLOAD_REF"
  | "MISSING_PROCESSOR_EVENT_REF"
  | "MISSING_VERIFIED_OPPORTUNITY_REF"
  | "MISSING_FUNDTRACKER_DECISION_REF"
  | "MISSING_SANDBOX_ATS_REF"
  | "MISSING_PAI_SAFE_CONTRACT_ID"
  | "MISSING_PAI_SAFE_DISPLAY_ID"
  | "LIVE_RAIL_LEAK_REFUSED"
  | "LIVE_PAYMENT_LEAK_REFUSED"
  | "LIVE_TRUTH_LEAK_REFUSED"
  | "LIVE_ATS_LEAK_REFUSED"
  | "CUSTODY_TRANSFER_LEAK_REFUSED"
  | "RUNTIME_ACTIVATION_LEAK_REFUSED"
  | "PAI_SAFE_AUTHORITY_LEAK_REFUSED"
  | "UI_AUTHORITY_LEAK_REFUSED"
  | "LEDGER_HASH_CHAIN_BROKEN"
  | "AUDIT_SPINE_PROOF_INCOMPLETE"
  | "REVIEW_PACKET_UNSUPPORTED_CLAIM";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentAuthority {
  readonly __brand: "LIVE_PAYMENT_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface LiveTruthAuthority {
  readonly __brand: "LIVE_TRUTH_AUTHORITY";
  mayCreateLiveTruth: true;
}

export interface RuntimeActivationAuthority {
  readonly __brand: "RUNTIME_ACTIVATION_AUTHORITY";
  mayActivateRuntime: true;
}

export interface SandboxEvidenceLedgerRecord {
  readonly __brand: "SANDBOX_EVIDENCE_LEDGER_RECORD";
  ledgerRecordId: string;
  transactionRef: string;
  status: SandboxEvidenceLedgerStatus;
  flowStatus: SandboxEndToEndTransactionFlowResult["status"];
  proofChain: RequiredSandboxProofChain;
  eventTrace: Array<{
    step:
      | "RAIL_INTAKE"
      | "PROCESSOR_EVENT_NORMALIZED"
      | "FUNDTRACKER_VERIFICATION"
      | "SANDBOX_ATS_EMISSION"
      | "PAI_SAFE_SURFACE_PROJECTION"
      | "PAI_SAFE_UI_DISPLAY";
    ref: string;
    authority:
      | "SandboxRailAdapter"
      | "FundTrackerAI"
      | "PAI-SAFE"
      | "PAI-SAFE-UI";
    createsTruth: boolean;
    createsLiveCapability: false;
  }>;
  hash: string;
  prevHash: string;
  refusalCodes: SandboxTrustSpineRefusalCode[];
  boundary: {
    ledgerIsSandboxOnly: true;
    ledgerCreatesNoLiveRails: true;
    ledgerCreatesNoLivePaymentProcessing: true;
    ledgerCreatesNoLiveTransactionTruth: true;
    ledgerCreatesNoLiveATS: true;
    ledgerCreatesNoCustodyTransfer: true;
    ledgerCreatesNoRuntimeActivation: true;
    ledgerIsEvidenceOnly: true;
  };
}

export interface SandboxAuditSpineBinding {
  readonly __brand: "SANDBOX_AUDIT_SPINE_BINDING";
  auditBindingId: string;
  transactionRef: string;
  status: SandboxAuditSpineStatus;
  ledgerRecordId: string;
  proofCompleteness: {
    railPayloadRef: true;
    sandboxProcessorEventRef: true;
    verifiedOpportunityRef: true;
    fundTrackerDecisionRef: true;
    sandboxAtsRef: true;
    paiSafeContractId: true;
    paiSafeDisplayId: true;
  };
  auditFindings: string[];
  refusalCodes: SandboxTrustSpineRefusalCode[];
  boundary: {
    auditIsReadOnly: true;
    auditCreatesNoTransactionTruth: true;
    auditCreatesNoLiveCapability: true;
    auditDoesNotMutateLedger: true;
    auditDoesNotAuthorizeRuntime: true;
  };
}

export interface SandboxReviewPacket {
  readonly __brand: "SANDBOX_REVIEW_PACKET";
  reviewPacketId: string;
  transactionRef: string;
  status: SandboxReviewPacketStatus;
  summary: string;
  verifiedClaims: string[];
  refusedClaims: string[];
  ledgerRecordId: string;
  auditBindingId: string;
  proofRefs: RequiredSandboxProofChain;
  boundary: {
    reviewIsHumanReadableOnly: true;
    reviewCreatesNoAuthority: true;
    reviewCreatesNoLiveRails: true;
    reviewCreatesNoPaymentProcessing: true;
    reviewCreatesNoRuntimeActivation: true;
    reviewDoesNotExceedVerifiedArtifacts: true;
  };
}

export interface SandboxTrustSpineConsolidationResult {
  readonly __brand: "SANDBOX_TRUST_SPINE_CONSOLIDATION_RESULT";
  consolidationId: string;
  status: SandboxTrustSpineStatus;
  transactionRef: string;
  e2eFlow: SandboxEndToEndTransactionFlowResult;
  ledgerRecord?: SandboxEvidenceLedgerRecord;
  auditBinding?: SandboxAuditSpineBinding;
  reviewPacket?: SandboxReviewPacket;
  refusalCodes: SandboxTrustSpineRefusalCode[];
  boundary: {
    consolidationIsSandboxOnly: true;
    noLiveRailsCreated: true;
    noLivePaymentProcessingCreated: true;
    noLiveTransactionTruthCreated: true;
    noLiveATSCreated: true;
    noCustodyTransferCreated: true;
    noRuntimeActivationCreated: true;
    evidenceLedgerIsNotAuthority: true;
    auditSpineIsReadOnly: true;
    reviewPacketIsNotLaunchApproval: true;
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

  return `{${entries.join(",")}}`;
}

function hash(input: string): string {
  let h = 2166136261;

  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return `fnv1a_${(h >>> 0).toString(16).padStart(8, "0")}`;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function missingProof(): RequiredSandboxProofChain {
  return {
    railPayloadRef: "MISSING",
    sandboxProcessorEventRef: "MISSING",
    verifiedOpportunityRef: "MISSING",
    fundTrackerDecisionRef: "MISSING",
    sandboxAtsRef: "MISSING",
    paiSafeContractId: "MISSING",
    paiSafeDisplayId: "MISSING"
  };
}

function requiredProofChain(flow: SandboxEndToEndTransactionFlowResult): {
  proof?: RequiredSandboxProofChain;
  refusals: SandboxTrustSpineRefusalCode[];
} {
  const refusals: SandboxTrustSpineRefusalCode[] = [];
  const proof = flow.proofChain;

  if (!hasText(proof.railPayloadRef)) refusals.push("MISSING_RAIL_PAYLOAD_REF");
  if (!hasText(proof.sandboxProcessorEventRef)) refusals.push("MISSING_PROCESSOR_EVENT_REF");
  if (!hasText(proof.verifiedOpportunityRef)) refusals.push("MISSING_VERIFIED_OPPORTUNITY_REF");
  if (!hasText(proof.fundTrackerDecisionRef)) refusals.push("MISSING_FUNDTRACKER_DECISION_REF");
  if (!hasText(proof.sandboxAtsRef)) refusals.push("MISSING_SANDBOX_ATS_REF");
  if (!hasText(proof.paiSafeContractId)) refusals.push("MISSING_PAI_SAFE_CONTRACT_ID");
  if (!hasText(proof.paiSafeDisplayId)) refusals.push("MISSING_PAI_SAFE_DISPLAY_ID");

  if (refusals.length > 0) return { refusals };

  const railPayloadRef: string = proof.railPayloadRef as string;
  const sandboxProcessorEventRef: string = proof.sandboxProcessorEventRef as string;
  const verifiedOpportunityRef: string = proof.verifiedOpportunityRef as string;
  const fundTrackerDecisionRef: string = proof.fundTrackerDecisionRef as string;
  const sandboxAtsRef: string = proof.sandboxAtsRef as string;
  const paiSafeContractId: string = proof.paiSafeContractId as string;
  const paiSafeDisplayId: string = proof.paiSafeDisplayId as string;

  return {
    refusals: [],
    proof: {
      railPayloadRef,
      sandboxProcessorEventRef,
      verifiedOpportunityRef,
      fundTrackerDecisionRef,
      sandboxAtsRef,
      paiSafeContractId,
      paiSafeDisplayId
    }
  };
}

function boundaryRefusals(flow: SandboxEndToEndTransactionFlowResult): SandboxTrustSpineRefusalCode[] {
  const refusals: SandboxTrustSpineRefusalCode[] = [];

  if (flow.boundary.e2eCreatesNoLiveRails !== true) refusals.push("LIVE_RAIL_LEAK_REFUSED");
  if (flow.boundary.e2eCreatesNoLivePaymentProcessing !== true) refusals.push("LIVE_PAYMENT_LEAK_REFUSED");
  if (flow.boundary.e2eCreatesNoLiveTransactionTruth !== true) refusals.push("LIVE_TRUTH_LEAK_REFUSED");
  if (flow.boundary.e2eCreatesNoLiveATS !== true) refusals.push("LIVE_ATS_LEAK_REFUSED");
  if (flow.boundary.e2eCreatesNoCustodyTransfer !== true) refusals.push("CUSTODY_TRANSFER_LEAK_REFUSED");
  if (flow.boundary.e2eCreatesNoRuntimeActivation !== true) refusals.push("RUNTIME_ACTIVATION_LEAK_REFUSED");
  if (flow.boundary.paiSafeIsDisplayOnly !== true) refusals.push("PAI_SAFE_AUTHORITY_LEAK_REFUSED");
  if (flow.boundary.uiIsDisplayOnly !== true) refusals.push("UI_AUTHORITY_LEAK_REFUSED");

  return refusals;
}

export function createSandboxEvidenceLedgerRecord(
  flow: SandboxEndToEndTransactionFlowResult,
  prevHash = "GENESIS"
): SandboxEvidenceLedgerRecord {
  const refusalCodes: SandboxTrustSpineRefusalCode[] = [];

  if (flow.status !== "SANDBOX_E2E_TRANSACTION_FLOW_READY") {
    refusalCodes.push("E2E_FLOW_NOT_READY");
  }

  refusalCodes.push(...boundaryRefusals(flow));

  const proofResult = requiredProofChain(flow);
  refusalCodes.push(...proofResult.refusals);

  if (!proofResult.proof) {
    const refusedRecordWithoutHash = {
      ledgerRecordId: `sandbox_ledger_${flow.transactionRef}`,
      transactionRef: flow.transactionRef,
      status: "SANDBOX_EVIDENCE_LEDGER_REFUSED" as const,
      flowStatus: flow.status,
      proofChain: {
        ...missingProof(),
        ...Object.fromEntries(
          Object.entries(flow.proofChain).map(([key, value]) => [key, hasText(value) ? value : "MISSING"])
        )
      } as RequiredSandboxProofChain,
      eventTrace: [] as SandboxEvidenceLedgerRecord["eventTrace"],
      prevHash,
      refusalCodes: unique(refusalCodes)
    };

    return {
      __brand: "SANDBOX_EVIDENCE_LEDGER_RECORD",
      ...refusedRecordWithoutHash,
      hash: hash(stableStringify(refusedRecordWithoutHash)),
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
  }

  const proof = proofResult.proof;

  const eventTrace: SandboxEvidenceLedgerRecord["eventTrace"] = [
    {
      step: "RAIL_INTAKE",
      ref: proof.railPayloadRef,
      authority: "SandboxRailAdapter",
      createsTruth: false,
      createsLiveCapability: false
    },
    {
      step: "PROCESSOR_EVENT_NORMALIZED",
      ref: proof.sandboxProcessorEventRef,
      authority: "SandboxRailAdapter",
      createsTruth: false,
      createsLiveCapability: false
    },
    {
      step: "FUNDTRACKER_VERIFICATION",
      ref: proof.fundTrackerDecisionRef,
      authority: "FundTrackerAI",
      createsTruth: true,
      createsLiveCapability: false
    },
    {
      step: "SANDBOX_ATS_EMISSION",
      ref: proof.sandboxAtsRef,
      authority: "FundTrackerAI",
      createsTruth: true,
      createsLiveCapability: false
    },
    {
      step: "PAI_SAFE_SURFACE_PROJECTION",
      ref: proof.paiSafeContractId,
      authority: "PAI-SAFE",
      createsTruth: false,
      createsLiveCapability: false
    },
    {
      step: "PAI_SAFE_UI_DISPLAY",
      ref: proof.paiSafeDisplayId,
      authority: "PAI-SAFE-UI",
      createsTruth: false,
      createsLiveCapability: false
    }
  ];

  const ledgerStatus: SandboxEvidenceLedgerStatus =
    refusalCodes.length === 0 ? "SANDBOX_EVIDENCE_LEDGER_READY" : "SANDBOX_EVIDENCE_LEDGER_REFUSED";

  const recordWithoutHash = {
    ledgerRecordId: `sandbox_ledger_${flow.transactionRef}`,
    transactionRef: flow.transactionRef,
    status: ledgerStatus,
    flowStatus: flow.status,
    proofChain: proof,
    eventTrace,
    prevHash,
    refusalCodes: unique(refusalCodes)
  };

  return {
    __brand: "SANDBOX_EVIDENCE_LEDGER_RECORD",
    ...recordWithoutHash,
    hash: hash(stableStringify(recordWithoutHash)),
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
}

export function verifySandboxEvidenceLedgerChain(records: SandboxEvidenceLedgerRecord[]): {
  valid: boolean;
  refusalCodes: SandboxTrustSpineRefusalCode[];
} {
  const refusalCodes: SandboxTrustSpineRefusalCode[] = [];

  for (let i = 0; i < records.length; i++) {
    const current = records[i];

    if (!current) {
      refusalCodes.push("LEDGER_HASH_CHAIN_BROKEN");
      continue;
    }

    const expectedPrevHash = i === 0 ? "GENESIS" : records[i - 1]?.hash;

    if (current.prevHash !== expectedPrevHash) {
      refusalCodes.push("LEDGER_HASH_CHAIN_BROKEN");
    }

    const recordWithoutHash = {
      ledgerRecordId: current.ledgerRecordId,
      transactionRef: current.transactionRef,
      status: current.status,
      flowStatus: current.flowStatus,
      proofChain: current.proofChain,
      eventTrace: current.eventTrace,
      prevHash: current.prevHash,
      refusalCodes: current.refusalCodes
    };

    if (current.hash !== hash(stableStringify(recordWithoutHash))) {
      refusalCodes.push("LEDGER_HASH_CHAIN_BROKEN");
    }
  }

  return {
    valid: refusalCodes.length === 0,
    refusalCodes: unique(refusalCodes)
  };
}

export function bindSandboxAuditSpine(
  ledgerRecord: SandboxEvidenceLedgerRecord
): SandboxAuditSpineBinding {
  const refusalCodes: SandboxTrustSpineRefusalCode[] = [];

  if (ledgerRecord.status !== "SANDBOX_EVIDENCE_LEDGER_READY") {
    refusalCodes.push("AUDIT_SPINE_PROOF_INCOMPLETE");
  }

  const proofComplete =
    ledgerRecord.proofChain.railPayloadRef !== "MISSING" &&
    ledgerRecord.proofChain.sandboxProcessorEventRef !== "MISSING" &&
    ledgerRecord.proofChain.verifiedOpportunityRef !== "MISSING" &&
    ledgerRecord.proofChain.fundTrackerDecisionRef !== "MISSING" &&
    ledgerRecord.proofChain.sandboxAtsRef !== "MISSING" &&
    ledgerRecord.proofChain.paiSafeContractId !== "MISSING" &&
    ledgerRecord.proofChain.paiSafeDisplayId !== "MISSING";

  if (!proofComplete) {
    refusalCodes.push("AUDIT_SPINE_PROOF_INCOMPLETE");
  }

  const auditFindings = proofComplete
    ? [
        "Proof chain complete.",
        "Sandbox rail intake preserved.",
        "FundTrackerAI verification reference preserved.",
        "Sandbox ATS reference preserved.",
        "PAI-SAFE projection reference preserved.",
        "PAI-SAFE UI display reference preserved.",
        "No live capability created."
      ]
    : ["Proof chain incomplete. Audit binding refused."];

  return {
    __brand: "SANDBOX_AUDIT_SPINE_BINDING",
    auditBindingId: `sandbox_audit_${ledgerRecord.transactionRef}`,
    transactionRef: ledgerRecord.transactionRef,
    status: refusalCodes.length === 0 ? "SANDBOX_AUDIT_SPINE_BOUND" : "SANDBOX_AUDIT_SPINE_REFUSED",
    ledgerRecordId: ledgerRecord.ledgerRecordId,
    proofCompleteness: {
      railPayloadRef: proofComplete as true,
      sandboxProcessorEventRef: proofComplete as true,
      verifiedOpportunityRef: proofComplete as true,
      fundTrackerDecisionRef: proofComplete as true,
      sandboxAtsRef: proofComplete as true,
      paiSafeContractId: proofComplete as true,
      paiSafeDisplayId: proofComplete as true
    },
    auditFindings,
    refusalCodes: unique(refusalCodes),
    boundary: {
      auditIsReadOnly: true,
      auditCreatesNoTransactionTruth: true,
      auditCreatesNoLiveCapability: true,
      auditDoesNotMutateLedger: true,
      auditDoesNotAuthorizeRuntime: true
    }
  };
}

export function generateSandboxReviewPacket(
  ledgerRecord: SandboxEvidenceLedgerRecord,
  auditBinding: SandboxAuditSpineBinding
): SandboxReviewPacket {
  const refusedClaims: string[] = [];
  const verifiedClaims: string[] = [];

  if (ledgerRecord.status !== "SANDBOX_EVIDENCE_LEDGER_READY") {
    refusedClaims.push("Ledger record is not ready.");
  }

  if (auditBinding.status !== "SANDBOX_AUDIT_SPINE_BOUND") {
    refusedClaims.push("Audit spine is not bound.");
  }

  if (refusedClaims.length === 0) {
    verifiedClaims.push(
      "Sandbox transaction completed end-to-end.",
      "Sandbox proof chain is complete.",
      "FundTrackerAI verified sandbox commitment.",
      "FundTrackerAI emitted sandbox-only ATS.",
      "PAI-SAFE projected display state only.",
      "PAI-SAFE UI displayed state only.",
      "No live rails were created.",
      "No live payment processing was created.",
      "No live transaction truth was created.",
      "No live ATS was created.",
      "No custody transfer was created.",
      "No runtime activation was created."
    );
  }

  return {
    __brand: "SANDBOX_REVIEW_PACKET",
    reviewPacketId: `sandbox_review_${ledgerRecord.transactionRef}`,
    transactionRef: ledgerRecord.transactionRef,
    status: refusedClaims.length === 0 ? "SANDBOX_REVIEW_PACKET_READY" : "SANDBOX_REVIEW_PACKET_BLOCKED",
    summary:
      refusedClaims.length === 0
        ? "Sandbox transaction completed with complete proof chain, audit binding, and review-ready record."
        : "Sandbox review packet blocked because required proof or audit binding is incomplete.",
    verifiedClaims,
    refusedClaims,
    ledgerRecordId: ledgerRecord.ledgerRecordId,
    auditBindingId: auditBinding.auditBindingId,
    proofRefs: ledgerRecord.proofChain,
    boundary: {
      reviewIsHumanReadableOnly: true,
      reviewCreatesNoAuthority: true,
      reviewCreatesNoLiveRails: true,
      reviewCreatesNoPaymentProcessing: true,
      reviewCreatesNoRuntimeActivation: true,
      reviewDoesNotExceedVerifiedArtifacts: true
    }
  };
}

export function runSandboxTrustSpineConsolidation(
  payload: RawSandboxRailPayload,
  prevHash = "GENESIS"
): SandboxTrustSpineConsolidationResult {
  const e2eFlow = runSandboxEndToEndTransactionFlow(payload);
  const refusalCodes: SandboxTrustSpineRefusalCode[] = [];

  if (e2eFlow.status !== "SANDBOX_E2E_TRANSACTION_FLOW_READY") {
    refusalCodes.push("E2E_FLOW_NOT_READY");
  }

  refusalCodes.push(...boundaryRefusals(e2eFlow));

  const ledgerRecord = createSandboxEvidenceLedgerRecord(e2eFlow, prevHash);

  if (ledgerRecord.status !== "SANDBOX_EVIDENCE_LEDGER_READY") {
    refusalCodes.push(...ledgerRecord.refusalCodes);
  }

  const auditBinding = bindSandboxAuditSpine(ledgerRecord);

  if (auditBinding.status !== "SANDBOX_AUDIT_SPINE_BOUND") {
    refusalCodes.push(...auditBinding.refusalCodes);
  }

  const reviewPacket = generateSandboxReviewPacket(ledgerRecord, auditBinding);

  if (reviewPacket.status !== "SANDBOX_REVIEW_PACKET_READY") {
    refusalCodes.push("REVIEW_PACKET_UNSUPPORTED_CLAIM");
  }

  return {
    __brand: "SANDBOX_TRUST_SPINE_CONSOLIDATION_RESULT",
    consolidationId: `sandbox_trust_spine_${payload.transactionRef ?? "unknown"}`,
    status:
      refusalCodes.length === 0
        ? "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY"
        : "SANDBOX_TRUST_SPINE_CONSOLIDATION_REFUSED",
    transactionRef: payload.transactionRef ?? "unknown",
    e2eFlow,
    ledgerRecord,
    auditBinding,
    reviewPacket,
    refusalCodes: unique(refusalCodes),
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
}

export function buildValidSandboxTrustSpinePayload(transactionRef: string): RawSandboxRailPayload {
  return buildValidSandboxE2EPayload(transactionRef);
}

export const SANDBOX_TRUST_SPINE_CONSOLIDATION_DOCTRINE = {
  name: "Sandbox Trust Spine Consolidation Run",
  class: "SANDBOX_EVIDENCE_LEDGER_AUDIT_REVIEW_LAYER",
  purpose:
    "Turn a verified sandbox end-to-end transaction into a durable evidence ledger record, audit spine binding, and human-readable review packet without creating live rails, payment processing, transaction truth, custody transfer, runtime activation, or launch approval.",
  boundary: {
    sandboxOnly: true,
    evidenceLedgerIsNotAuthority: true,
    auditSpineIsReadOnly: true,
    reviewPacketIsNotLaunchApproval: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true
  }
} as const;

