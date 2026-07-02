import type { ActivatedTransactionState } from "../fundtracker/types";
import type {
  AnomalyFlag,
  GovernedFinancialOversightState,
  MerchantHealthState,
  OversightBuildInput,
  TransactionSummary,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function summarizeTransaction(
  state: ActivatedTransactionState,
): TransactionSummary {
  return {
    transactionId: state.transactionId,
    merchantId: state.merchantId,
    customerId: state.customerId,
    grossAmount: state.grossAmount,
    processorFees: state.processorFees,
    platformFees: state.platformFees,
    netAmount: state.netAmount,
    currency: state.currency,
    activationPermission: state.activationPermission,
    paymentStatus: state.paymentStatus,
    verificationStatus: state.verificationStatus,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
  };
}

export function detectAnomalies(
  transactions: ActivatedTransactionState[],
  refundExposure = 0,
  disputeExposure = 0,
): AnomalyFlag[] {
  const anomalies: AnomalyFlag[] = [];

  const grossRevenue = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const totalFees = transactions.reduce(
    (sum, tx) => sum + tx.processorFees + tx.platformFees,
    0,
  );
  const netRevenue = transactions.reduce((sum, tx) => sum + tx.netAmount, 0);

  if (grossRevenue > 0 && totalFees / grossRevenue > 0.08) {
    anomalies.push({
      code: "HIGH_FEE_EXPOSURE",
      message: "Combined processor and platform fee exposure is elevated.",
      severity: "medium",
      details: {
        grossRevenue: round(grossRevenue),
        totalFees: round(totalFees),
        feeRatio: round(totalFees / grossRevenue),
      },
    });
  }

  if (netRevenue < grossRevenue * 0.75 && grossRevenue > 0) {
    anomalies.push({
      code: "LOW_NET_REVENUE",
      message: "Net revenue is materially lower than gross revenue.",
      severity: "medium",
      details: {
        grossRevenue: round(grossRevenue),
        netRevenue: round(netRevenue),
      },
    });
  }

  if (refundExposure > 0) {
    anomalies.push({
      code: "REFUND_EXPOSURE",
      message: "Refund exposure is present for this oversight period.",
      severity: refundExposure > 1000 ? "high" : "medium",
      details: {
        refundExposure: round(refundExposure),
      },
    });
  }

  if (disputeExposure > 0) {
    anomalies.push({
      code: "DISPUTE_EXPOSURE",
      message: "Dispute exposure is present for this oversight period.",
      severity: disputeExposure > 500 ? "high" : "medium",
      details: {
        disputeExposure: round(disputeExposure),
      },
    });
  }

  const invalidActivation = transactions.some((tx) => !tx.activationPermission);
  if (invalidActivation) {
    anomalies.push({
      code: "MISSING_ACTIVATION_PERMISSION",
      message:
        "One or more transactions reached the oversight layer without activation permission.",
      severity: "high",
    });
  }

  return anomalies;
}

export function determineMerchantHealthState(
  anomalies: AnomalyFlag[],
): MerchantHealthState {
  if (anomalies.some((a) => a.severity === "high")) {
    return "at-risk";
  }

  if (anomalies.some((a) => a.severity === "medium")) {
    return "watch";
  }

  return "healthy";
}

export function recommendOperatorActions(
  anomalies: AnomalyFlag[],
): string[] {
  const actions = new Set<string>();

  for (const anomaly of anomalies) {
    switch (anomaly.code) {
      case "HIGH_FEE_EXPOSURE":
        actions.add("Review processor-fee and platform-fee structure.");
        actions.add("Evaluate routing and pricing efficiency.");
        break;
      case "LOW_NET_REVENUE":
        actions.add("Review transaction economics and margin leakage.");
        break;
      case "REFUND_EXPOSURE":
        actions.add("Audit refund causes and isolate recurring failure patterns.");
        break;
      case "DISPUTE_EXPOSURE":
        actions.add("Prepare dispute defense packages and review transaction proof quality.");
        break;
      case "MISSING_ACTIVATION_PERMISSION":
        actions.add("Investigate downstream activation boundary integrity immediately.");
        break;
      default:
        actions.add("Review oversight anomalies for operator follow-up.");
        break;
    }
  }

  if (actions.size === 0) {
    actions.add("No immediate operator action required.");
  }

  return Array.from(actions);
}

export function buildOversightState(
  input: OversightBuildInput,
): GovernedFinancialOversightState {
  const refundExposure = input.refundExposure ?? 0;
  const disputeExposure = input.disputeExposure ?? 0;

  const grossRevenue = round(
    input.transactions.reduce((sum, tx) => sum + tx.grossAmount, 0),
  );
  const netRevenue = round(
    input.transactions.reduce((sum, tx) => sum + tx.netAmount, 0),
  );
  const feeExposure = round(
    input.transactions.reduce(
      (sum, tx) => sum + tx.processorFees + tx.platformFees,
      0,
    ),
  );

  const anomalyFlags = detectAnomalies(
    input.transactions,
    refundExposure,
    disputeExposure,
  );
  const merchantHealthState = determineMerchantHealthState(anomalyFlags);
  const recommendedActions = recommendOperatorActions(anomalyFlags);

  return {
    oversightStateId: `ofs_${input.period.replace(/[^0-9A-Za-z]/g, "_")}`,
    period: input.period,
    sourceSystems: ["FundTrackerAI"],
    grossRevenue,
    netRevenue,
    feeExposure,
    refundExposure: round(refundExposure),
    disputeExposure: round(disputeExposure),
    anomalyFlags,
    complianceFlags: [],
    merchantHealthState,
    recommendedActions,
    generatedAt: nowIso(),
  };
}
