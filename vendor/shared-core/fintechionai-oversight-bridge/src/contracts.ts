import type { ActivatedTransactionStateRecord } from "../../fundtracker-bridge/src/index.js";
import type { ProtectedFlowResult } from "../../protected-flow-layer/src/index.js";

export type OversightDecision =
  | "OVERSIGHT_READY"
  | "OVERSIGHT_WARNING"
  | "OVERSIGHT_ESCALATED"
  | "REFUSED_MALFORMED"
  | "REFUSED_UNTRUSTED";

export type MerchantHealthState =
  | "healthy"
  | "watch"
  | "elevated_risk"
  | "degraded";

export interface OversightAnomalyFlag {
  anomalyId: string;
  category:
    | "fee_exposure"
    | "refund_exposure"
    | "dispute_exposure"
    | "compliance_exposure"
    | "flow_swelling"
    | "activation_risk";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
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
  anomalyFlags: OversightAnomalyFlag[];
  complianceFlags: string[];
  merchantHealthState: MerchantHealthState;
  recommendedActions: string[];
  activationCount: number;
  protectedFlowDecision: ProtectedFlowResult["snapshot"]["decision"];
  generatedAt: string;
}

export interface FinTechionAIOversightInput {
  activationRecords: ActivatedTransactionStateRecord[];
  protectedFlow: ProtectedFlowResult;
  processorFeeRate?: number;
  refundExposure?: number;
  disputeExposure?: number;
  period?: string;
  sourceSystems?: string[];
}

export interface FinTechionAIOversightResult {
  trusted: boolean;
  decision: OversightDecision;
  reason: string;
  oversightState: GovernedFinancialOversightState | null;
  trustedEnvelopeId?: string;
  authorizationDecision?: string;
  registryValid?: boolean;
}