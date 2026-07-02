import type { ComplianceSnapshot } from "../../ecosystem-value/src/index.js";
import type { ActivatedTransactionStateRecord } from "../../fundtracker-bridge/src/index.js";

export type ReceivingDecision =
  | "RECEIVED"
  | "REFUSED_MALFORMED"
  | "REFUSED_UNTRUSTED"
  | "REFUSED_UNAUTHORIZED"
  | "REFUSED_UNCOMPLIANT"
  | "REFUSED_QUARANTINED"
  | "REFUSED_TAMPERED";

export interface ReceivingPolicy {
  requiredActivationStatus: "activated";
  requiredComplianceStatus: "compliant";
  trustScope: string;
  artifactType: string;
  receivingEnvironment: string;
}

export interface LiveSystemRecord {
  liveRecordId: string;
  sourceActivationId: string;
  receivingEnvironment: string;
  walletId: string;
  ownerId: string;
  merchantId: string;
  jurisdictionCode: string;
  settlementCurrency: string;
  settlementAmount: number;
  displayCurrency: string;
  displayAmount: number;
  realValueUnits: number;
  complianceSnapshot: ComplianceSnapshot;
  recordStatus: "live";
  occurredAt: string;
}

export interface TrustedActivationResult {
  trusted: boolean;
  decision:
    | "TRUSTED"
    | "REFUSED_MALFORMED"
    | "REFUSED_UNAUTHORIZED"
    | "REFUSED_QUARANTINED"
    | "REFUSED_TAMPERED";
  reason: string;
  activationRecord: ActivatedTransactionStateRecord;
  trustedEnvelopeId?: string;
  authorizationDecision?: string;
  registryValid?: boolean;
}

export interface ReceivingResult {
  received: boolean;
  decision: ReceivingDecision;
  reason: string;
  sourceActivationRecord: ActivatedTransactionStateRecord | null;
  liveSystemRecord: LiveSystemRecord | null;
  trustedEnvelopeId?: string;
  authorizationDecision?: string;
  registryValid?: boolean;
}