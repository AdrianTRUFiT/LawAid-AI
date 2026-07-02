import type {
  FundingChoice,
  ComplianceSnapshot,
  SettlementRecord,
} from "../../ecosystem-value/src/index.js";

export type FundTrackerDecision =
  | "ACTIVATED"
  | "REFUSED_UNTRUSTED"
  | "REFUSED_UNAUTHORIZED"
  | "REFUSED_UNCOMPLIANT"
  | "REFUSED_MALFORMED"
  | "REFUSED_QUARANTINED"
  | "REFUSED_TAMPERED";

export interface FundTrackerActivationPolicy {
  requiredBridgeDecision: "TRUSTED";
  requiredAuthorizationDecision: "approved";
  requiredComplianceStatus: "compliant";
  trustScope: string;
  artifactType: string;
}

export interface ActivatedTransactionStateRecord {
  activationId: string;
  sourceSettlementId: string;
  walletId: string;
  ownerId: string;
  merchantId: string;
  jurisdictionCode: string;
  settlementCurrency: string;
  settlementAmount: number;
  displayCurrency: string;
  displayAmount: number;
  realValueUnits: number;
  fundingChoices: FundingChoice[];
  complianceSnapshot: ComplianceSnapshot;
  activationStatus: "activated";
  occurredAt: string;
}

export interface FundTrackerActivationResult {
  activated: boolean;
  decision: FundTrackerDecision;
  reason: string;
  sourceSettlementRecord: SettlementRecord | null;
  activationRecord: ActivatedTransactionStateRecord | null;
  trustedEnvelopeId?: string;
  authorizationDecision?: string;
  registryValid?: boolean;
}