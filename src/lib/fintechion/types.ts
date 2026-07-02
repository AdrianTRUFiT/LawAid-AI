import type { ActivatedTransactionState } from "../fundtracker/types";

export type MerchantHealthState = "healthy" | "watch" | "at-risk" | "critical";

export interface AnomalyFlag {
  code:
    | "LOW_NET_REVENUE"
    | "HIGH_FEE_EXPOSURE"
    | "REFUND_EXPOSURE"
    | "DISPUTE_EXPOSURE"
    | "MISSING_ACTIVATION_PERMISSION"
    | "UNKNOWN";
  message: string;
  severity: "low" | "medium" | "high";
  details?: Record<string, unknown>;
}

export interface TransactionSummary {
  transactionId: string;
  merchantId: string;
  customerId: string;
  grossAmount: number;
  processorFees: number;
  platformFees: number;
  netAmount: number;
  currency: string;
  activationPermission: boolean;
  paymentStatus: string;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernedFinancialOversightState {
  oversightStateId: string;
  period: string;
  sourceSystems: string[];
  grossRevenue: number;
  netRevenue: number;
  feeExposure: number;
  refundExposure: number;
  disputeExposure: number;
  anomalyFlags: AnomalyFlag[];
  complianceFlags: string[];
  merchantHealthState: MerchantHealthState;
  recommendedActions: string[];
  generatedAt: string;
}

export interface OversightBuildInput {
  period: string;
  transactions: ActivatedTransactionState[];
  refundExposure?: number;
  disputeExposure?: number;
}
