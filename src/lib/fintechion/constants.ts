import type { MerchantHealthState } from "./types";

export const FINTECHION_VERSION = "1.0.0";

export const FINTECHION_ARTIFACT_TYPES = {
  oversightBuildInput: "OversightBuildInput",
  governedFinancialOversightState: "GovernedFinancialOversightState",
  anomalyState: "FinTechionAnomalyState",
} as const;

export const FINTECHION_SOURCE_SYSTEMS = {
  fundTracker: "FundTrackerAI",
} as const;

export const FINTECHION_HEALTH_STATES: MerchantHealthState[] = [
  "healthy",
  "watch",
  "at-risk",
  "critical",
];

export const FINTECHION_ANOMALY_CODES = {
  lowNetRevenue: "LOW_NET_REVENUE",
  highFeeExposure: "HIGH_FEE_EXPOSURE",
  refundExposure: "REFUND_EXPOSURE",
  disputeExposure: "DISPUTE_EXPOSURE",
  missingActivationPermission: "MISSING_ACTIVATION_PERMISSION",
  unknown: "UNKNOWN",
} as const;

export const FINTECHION_FEE_EXPOSURE_WARNING_RATIO = 0.08;
export const FINTECHION_LOW_NET_REVENUE_RATIO = 0.75;
export const FINTECHION_HIGH_REFUND_EXPOSURE = 1000;
export const FINTECHION_HIGH_DISPUTE_EXPOSURE = 500;
