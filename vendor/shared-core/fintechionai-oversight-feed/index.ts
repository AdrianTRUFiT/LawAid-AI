export type OversightRoute =
  | "none"
  | "monitor"
  | "review"
  | "respond"
  | "escalate";

export type OversightSignalClass =
  | "AUTHORITY_REFUSAL"
  | "FRAUD_PRESSURE"
  | "TRIPWIRE_PRESSURE"
  | "PROOF_HEALTH"
  | "ATS_GATE"
  | "MEMORY_BOUNDARY"
  | "PAI_SAFE_DISPLAY"
  | "AUDIT_SPINE";

export interface OperatorCommandState {
  readonly __brand: "OPERATOR_COMMAND_STATE";
  commandId: string;
  commandAuthority: true;
}

export interface IncomingFinTechionOversightSignal {
  signalId: string;
  transactionRef: string;
  signalClass: OversightSignalClass;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  sourceRef: string;
  containsConsumerPII: boolean;
  containsRawFinancialSource: boolean;
}

export interface FinTechionOversightSignal {
  signalId: string;
  transactionRef: string;
  signalClass: OversightSignalClass;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  sourceRef: string;
  containsConsumerPII: false;
  containsRawFinancialSource: false;
}

export interface FinTechionOversightFeed {
  readonly __brand: "FINTECHIONAI_READ_ONLY_OVERSIGHT_FEED";
  feedId: string;
  transactionRef: string;
  route: OversightRoute;
  signals: ReadonlyArray<FinTechionOversightSignal>;
  operatorSummary: string;
  boundary: {
    oversightIsReadOnly: true;
    oversightIsNotTransactionTruth: true;
    oversightDoesNotOverrideFundTrackerAI: true;
    oversightDoesNotCreateActivatedTransactionState: true;
    oversightDoesNotAuthorizeConsequence: true;
    noConsumerPIICrossesFeed: true;
    noRawFinancialSourceCrossesFeed: true;
    noWritePathBackToGTISOrFundTrackerAI: true;
  };
}

export interface FinTechionOversightFeedInput {
  transactionRef: string;
  signals: IncomingFinTechionOversightSignal[];
}

function severityRank(severity: FinTechionOversightSignal["severity"]): number {
  if (severity === "CRITICAL") return 4;
  if (severity === "HIGH") return 3;
  if (severity === "MEDIUM") return 2;
  return 1;
}

function toCleanSignal(signal: IncomingFinTechionOversightSignal): FinTechionOversightSignal {
  return {
    signalId: signal.signalId,
    transactionRef: signal.transactionRef,
    signalClass: signal.signalClass,
    severity: signal.severity,
    summary: signal.summary,
    sourceRef: signal.sourceRef,
    containsConsumerPII: false,
    containsRawFinancialSource: false
  };
}

export function buildFinTechionReadOnlyOversightFeed(
  input: FinTechionOversightFeedInput
): FinTechionOversightFeed {
  const cleanSignals = input.signals
    .filter((signal) => signal.containsConsumerPII === false && signal.containsRawFinancialSource === false)
    .map(toCleanSignal);

  const highestRank = cleanSignals.reduce((max, signal) => Math.max(max, severityRank(signal.severity)), 0);

  const route: OversightRoute =
    highestRank >= 4
      ? "escalate"
      : highestRank === 3
        ? "respond"
        : highestRank === 2
          ? "review"
          : highestRank === 1
            ? "monitor"
            : "none";

  return {
    __brand: "FINTECHIONAI_READ_ONLY_OVERSIGHT_FEED",
    feedId: `fintechionai_readonly_feed_${input.transactionRef}`,
    transactionRef: input.transactionRef,
    route,
    signals: cleanSignals,
    operatorSummary:
      "FinTechionAI oversight feed is read-only operator visibility. It cannot write to GTIS, FundTrackerAI, PAI-SAFE, or ATS state.",
    boundary: {
      oversightIsReadOnly: true,
      oversightIsNotTransactionTruth: true,
      oversightDoesNotOverrideFundTrackerAI: true,
      oversightDoesNotCreateActivatedTransactionState: true,
      oversightDoesNotAuthorizeConsequence: true,
      noConsumerPIICrossesFeed: true,
      noRawFinancialSourceCrossesFeed: true,
      noWritePathBackToGTISOrFundTrackerAI: true
    }
  };
}

export const FINTECHIONAI_OVERSIGHT_FEED_DOCTRINE = {
  name: "FinTechionAI Read-Only Oversight Feed",
  class: "OPERATOR_FINANCIAL_VISIBILITY_LAYER",
  purpose:
    "Provide operator-side financial oversight visibility without any write path back to GTIS, FundTrackerAI, ATS, or transaction truth.",
  boundary: {
    oversightIsReadOnly: true,
    oversightIsNotCommand: true,
    noPIIInFeed: true,
    noRawFinancialSourceInFeed: true,
    noWritePathBackToTruthLayer: true
  }
} as const;
