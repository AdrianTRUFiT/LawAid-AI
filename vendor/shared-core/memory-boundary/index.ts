export type CustodyClass =
  | "PUBLIC_SAFE"
  | "LEDGER_SAFE"
  | "MEMORY_SAFE"
  | "PRIVATE_SOURCE"
  | "LEGAL_EVIDENCE"
  | "RAW_FINANCIAL_SOURCE";

export type RedactionLevel =
  | "NONE"
  | "SUMMARY_ONLY"
  | "PARTIAL"
  | "FULL";

export type RetentionRule =
  | "SESSION_ONLY"
  | "USER_CONTAINER"
  | "TIME_BOUND"
  | "DELETE_ON_REQUEST"
  | "LEGAL_HOLD";

export type DownstreamConsumer =
  | "SoulBaseAI"
  | "SoulVault"
  | "PAI_SAFE"
  | "FinTechionAI"
  | "LawAidAI"
  | "AIVA";

export type MemoryBoundaryStatus =
  | "MEMORY_PROJECTION_PERMITTED"
  | "MEMORY_PROJECTION_REFUSED"
  | "CUSTODY_REDIRECT_REQUIRED";

export type MemoryBoundaryRefusalCode =
  | "RAW_PROCESSOR_OBJECT_REFUSED"
  | "RAW_BANK_STATEMENT_REFUSED"
  | "FULL_ACCOUNT_NUMBER_REFUSED"
  | "UNREDACTED_PAYMENT_METHOD_REFUSED"
  | "UNRESTRICTED_FINANCIAL_HISTORY_REFUSED"
  | "PRIVATE_SOURCE_DOCUMENT_REFUSED"
  | "LEGAL_EVIDENCE_FILE_REFUSED"
  | "CUSTODY_CLASS_REQUIRED"
  | "REDACTION_LEVEL_REQUIRED"
  | "RETENTION_RULE_REQUIRED"
  | "USER_CONTAINER_SCOPE_REQUIRED"
  | "DOWNSTREAM_PERMISSION_REQUIRED"
  | "SOULBASEAI_RAW_SOURCE_REFUSED"
  | "SOULVAULT_REQUIRED_FOR_RAW_SOURCE";

export interface LedgerSafeSummary {
  summaryId: string;
  transactionRef: string;
  merchantContinuityRef?: string;
  amountBand?: string;
  status: "held" | "refused" | "verified" | "activated" | "requires_review";
  narrative: string;
}

export interface FinancialMemoryProjection {
  activatedTransactionStateId?: string;
  ledgerSafeSummary: LedgerSafeSummary;
  merchantContinuityRef?: string;
  custodyClass: Exclude<CustodyClass, "RAW_FINANCIAL_SOURCE" | "LEGAL_EVIDENCE" | "PRIVATE_SOURCE">;
  redactionLevel: Exclude<RedactionLevel, "NONE">;
  retentionRule: Exclude<RetentionRule, "LEGAL_HOLD">;
  userContainerScope: string;
  downstreamConsumerPermissions: DownstreamConsumer[];
}

export interface RawFinancialSourceFlags {
  hasRawProcessorObject?: boolean;
  hasRawBankStatement?: boolean;
  hasFullAccountNumber?: boolean;
  hasUnredactedPaymentMethod?: boolean;
  hasUnrestrictedFinancialHistory?: boolean;
  hasPrivateSourceDocument?: boolean;
  hasLegalEvidenceFile?: boolean;
}

export interface MemoryBoundaryInput {
  transactionRef: string;
  sourceSystem: "FundTrackerAI" | "GTIS" | "LawAidAI" | "AIVA";
  intendedConsumer: DownstreamConsumer;
  projection?: FinancialMemoryProjection;
  custodyClass?: CustodyClass;
  redactionLevel?: RedactionLevel;
  retentionRule?: RetentionRule;
  userContainerScope?: string;
  downstreamConsumerPermissions?: DownstreamConsumer[];
  rawFlags: RawFinancialSourceFlags;
}

export interface MemoryBoundaryDecision {
  decisionId: string;
  transactionRef: string;
  status: MemoryBoundaryStatus;
  permittedProjection?: FinancialMemoryProjection;
  custodyRedirectTarget?: "SoulVault";
  refusalReasons: MemoryBoundaryRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    memoryBoundaryIsNotPaymentAuthority: true;
    memoryBoundaryIsNotTransactionTruth: true;
    memoryBoundaryIsNotCustodyTransfer: true;
    memoryBoundaryIsNotRuntimeActivation: true;
    soulBaseAIReceivesOnlyPermittedProjection: true;
    soulVaultRetainsRawSourceCustody: true;
    rawFinancialDataCannotCrossToSoulBaseAI: true;
  };
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function rawFlagRefusals(flags: RawFinancialSourceFlags): MemoryBoundaryRefusalCode[] {
  const refusals: MemoryBoundaryRefusalCode[] = [];

  if (flags.hasRawProcessorObject) refusals.push("RAW_PROCESSOR_OBJECT_REFUSED");
  if (flags.hasRawBankStatement) refusals.push("RAW_BANK_STATEMENT_REFUSED");
  if (flags.hasFullAccountNumber) refusals.push("FULL_ACCOUNT_NUMBER_REFUSED");
  if (flags.hasUnredactedPaymentMethod) refusals.push("UNREDACTED_PAYMENT_METHOD_REFUSED");
  if (flags.hasUnrestrictedFinancialHistory) refusals.push("UNRESTRICTED_FINANCIAL_HISTORY_REFUSED");
  if (flags.hasPrivateSourceDocument) refusals.push("PRIVATE_SOURCE_DOCUMENT_REFUSED");
  if (flags.hasLegalEvidenceFile) refusals.push("LEGAL_EVIDENCE_FILE_REFUSED");

  return refusals;
}

export function evaluateMemoryBoundary(input: MemoryBoundaryInput): MemoryBoundaryDecision {
  const refusalReasons: MemoryBoundaryRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  refusalReasons.push(...rawFlagRefusals(input.rawFlags));

  if (!input.custodyClass) {
    refusalReasons.push("CUSTODY_CLASS_REQUIRED");
    requiredCorrections.push("Assign custody class before memory projection.");
  }

  if (!input.redactionLevel) {
    refusalReasons.push("REDACTION_LEVEL_REQUIRED");
    requiredCorrections.push("Assign redaction level before memory projection.");
  }

  if (!input.retentionRule) {
    refusalReasons.push("RETENTION_RULE_REQUIRED");
    requiredCorrections.push("Assign retention rule before memory projection.");
  }

  if (!hasText(input.userContainerScope)) {
    refusalReasons.push("USER_CONTAINER_SCOPE_REQUIRED");
    requiredCorrections.push("Assign user container scope before memory projection.");
  }

  if (!input.downstreamConsumerPermissions || input.downstreamConsumerPermissions.length === 0) {
    refusalReasons.push("DOWNSTREAM_PERMISSION_REQUIRED");
    requiredCorrections.push("Assign downstream consumer permissions.");
  }

  const rawSourceAttempt =
    input.custodyClass === "RAW_FINANCIAL_SOURCE" ||
    input.custodyClass === "PRIVATE_SOURCE" ||
    input.custodyClass === "LEGAL_EVIDENCE" ||
    rawFlagRefusals(input.rawFlags).length > 0;

  if (input.intendedConsumer === "SoulBaseAI" && rawSourceAttempt) {
    refusalReasons.push("SOULBASEAI_RAW_SOURCE_REFUSED");
    requiredCorrections.push("SoulBaseAI may receive only permitted memory projections, never raw source data.");
  }

  if (rawSourceAttempt) {
    refusalReasons.push("SOULVAULT_REQUIRED_FOR_RAW_SOURCE");
    requiredCorrections.push("Redirect raw source data to SoulVault custody.");
  }

  const projectionPermitted =
    refusalReasons.length === 0 &&
    input.intendedConsumer === "SoulBaseAI" &&
    input.projection !== undefined;

  return {
    decisionId: `memory_boundary_${input.transactionRef}`,
    transactionRef: input.transactionRef,
    status: projectionPermitted
      ? "MEMORY_PROJECTION_PERMITTED"
      : rawSourceAttempt
        ? "CUSTODY_REDIRECT_REQUIRED"
        : "MEMORY_PROJECTION_REFUSED",
    ...(projectionPermitted && input.projection ? { permittedProjection: input.projection } : {}),
    ...(rawSourceAttempt ? { custodyRedirectTarget: "SoulVault" as const } : {}),
    refusalReasons: unique(refusalReasons),
    requiredCorrections: unique(requiredCorrections),
    boundary: {
      memoryBoundaryIsNotPaymentAuthority: true,
      memoryBoundaryIsNotTransactionTruth: true,
      memoryBoundaryIsNotCustodyTransfer: true,
      memoryBoundaryIsNotRuntimeActivation: true,
      soulBaseAIReceivesOnlyPermittedProjection: true,
      soulVaultRetainsRawSourceCustody: true,
      rawFinancialDataCannotCrossToSoulBaseAI: true
    }
  };
}

export const MEMORY_BOUNDARY_DOCTRINE = {
  name: "Memory Boundary Module",
  class: "FINANCIAL_MEMORY_CUSTODY_ENFORCEMENT_LAYER",
  purpose:
    "Permit only bounded financial memory projections into SoulBaseAI while redirecting raw financial source data to SoulVault custody.",
  boundary: {
    soulBaseAIReceivesOnlyPermittedMemoryProjection: true,
    soulVaultRetainsRawSourceCustody: true,
    rawFinancialDataCannotCrossToSoulBaseAI: true,
    memoryIsDerivedCustodyIsOriginal: true
  }
} as const;
