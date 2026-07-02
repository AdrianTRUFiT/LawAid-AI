import type { ComplianceSnapshot, SettlementRecord } from "./contracts.js";

export type TrustBridgeDecision =
  | "TRUSTED"
  | "REFUSED_MALFORMED"
  | "REFUSED_UNAUTHORIZED"
  | "REFUSED_QUARANTINED"
  | "REFUSED_TAMPERED";

export interface TrustWrappedSettlementResult {
  trusted: boolean;
  decision: TrustBridgeDecision;
  reason: string;
  settlementRecord: SettlementRecord;
  trustedEnvelopeId?: string;
  authorizationDecision?: string;
  registryValid?: boolean;
}

export interface IncomingTrustValidationResult {
  accepted: boolean;
  decision: TrustBridgeDecision;
  reason: string;
  settlementRecord: SettlementRecord | null;
  complianceSnapshot: ComplianceSnapshot | null;
}

export interface SettlementBridgePolicy {
  trustScope: string;
  artifactType: string;
  requireComplianceStatus: "compliant";
  requireSettledStatus: boolean;
}