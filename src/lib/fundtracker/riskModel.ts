import type { ProcessorEvent, RefusalReason, TransactionIntent } from "./types";
import {
  getMerchantRiskPolicy,
  type MerchantRiskPolicy,
} from "./merchantPolicy";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskSignal {
  code:
    | "HIGH_AMOUNT"
    | "SUSPICIOUS_RAIL"
    | "MISSING_METADATA"
    | "NON_USD"
    | "HIGH_RISK_SOURCE"
    | "UNKNOWN";
  message: string;
  weight: number;
  details?: Record<string, unknown>;
}

export interface RiskAssessment {
  score: number;
  riskLevel: RiskLevel;
  signals: RiskSignal[];
  recommendedAction: "verify" | "hold" | "refuse";
  evaluatedAt: string;
  policyApplied: MerchantRiskPolicy;
}

function nowIso(): string {
  return new Date().toISOString();
}

function determineRiskLevel(
  score: number,
  policy: MerchantRiskPolicy,
): RiskLevel {
  if (score >= policy.criticalRiskMin) return "critical";
  if (score >= policy.highRiskMin) return "high";
  if (score >= policy.mediumRiskMin) return "medium";
  return "low";
}

function determineRecommendedAction(
  riskLevel: RiskLevel,
): "verify" | "hold" | "refuse" {
  switch (riskLevel) {
    case "critical":
      return "refuse";
    case "high":
      return "hold";
    case "medium":
      return "hold";
    case "low":
    default:
      return "verify";
  }
}

export function assessTransactionRisk(
  intent: TransactionIntent,
  event: ProcessorEvent,
): RiskAssessment {
  const policy = getMerchantRiskPolicy(intent.verifiedOpportunity.merchantId);
  const signals: RiskSignal[] = [];
  const opportunity = intent.verifiedOpportunity;

  if (opportunity.amount >= policy.highAmountThreshold) {
    signals.push({
      code: "HIGH_AMOUNT",
      message: "Transaction amount exceeds the merchant risk threshold.",
      weight: 30,
      details: {
        amount: opportunity.amount,
        threshold: policy.highAmountThreshold,
      },
    });
  }

  if (opportunity.currency !== "USD" && !policy.allowNonUsd) {
    signals.push({
      code: "NON_USD",
      message: "Currency is outside the merchant low-risk profile.",
      weight: policy.nonUsdWeight,
      details: { currency: opportunity.currency },
    });
  }

  if (!opportunity.metadata || Object.keys(opportunity.metadata).length === 0) {
    signals.push({
      code: "MISSING_METADATA",
      message: "Verified opportunity metadata is missing or empty.",
      weight: policy.missingMetadataWeight,
    });
  }

  const sourceSystem = String(opportunity.sourceSystem || "").toLowerCase();
  if (sourceSystem.includes("unknown") || sourceSystem.includes("manual")) {
    signals.push({
      code: "HIGH_RISK_SOURCE",
      message: "Source system is categorized as higher risk.",
      weight: policy.highRiskSourceWeight,
      details: { sourceSystem: opportunity.sourceSystem },
    });
  }

  const rail = String(event.metadata?.rail || "").toLowerCase();
  const isSuspiciousRail =
    rail.includes("seed") || rail.includes("manual") || rail.includes("test");

  if (isSuspiciousRail && !policy.allowTestRails) {
    signals.push({
      code: "SUSPICIOUS_RAIL",
      message: "Processor rail is categorized as non-production or suspicious.",
      weight: policy.suspiciousRailWeight,
      details: { rail: event.metadata?.rail ?? null },
    });
  }

  const score = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const riskLevel = determineRiskLevel(score, policy);

  return {
    score,
    riskLevel,
    signals,
    recommendedAction: determineRecommendedAction(riskLevel),
    evaluatedAt: nowIso(),
    policyApplied: policy,
  };
}

export function riskSignalsToRefusalReasons(
  assessment: RiskAssessment,
): RefusalReason[] {
  return assessment.signals.map((signal) => ({
    code: "UNKNOWN",
    message: `[${signal.code}] ${signal.message}`,
    details: {
      riskWeight: signal.weight,
      policy: assessment.policyApplied.profileName,
      ...signal.details,
    },
  }));
}
