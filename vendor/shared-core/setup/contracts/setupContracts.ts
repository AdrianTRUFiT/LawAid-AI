export type SignalSource =
  | "DIRECT_USER"
  | "MERCHANT"
  | "BANK"
  | "LAW_AID"
  | "TRAVEL"
  | "TPS"
  | "PAID"
  | "UNKNOWN";

export type NeedUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DeliverySurface =
  | "PAID_DASHBOARD"
  | "SOULSEED_LOCAL_PACKAGE"
  | "WEB_DASHBOARD"
  | "MOBILE_GUIDE"
  | "MERCHANT_PORTAL"
  | "SUPPORT_ROUTE"
  | "HOLD_QUEUE";

export type SetupDecision = "ASSEMBLE" | "HOLD" | "REFUSE";

export interface RawNeedSignal {
  signalId: string;
  source: SignalSource;
  userStatement: string;
  createdAt: string;
}

export interface CapturedNeedSignal {
  signalId: string;
  capturedSignalId: string;
  source: SignalSource;
  captured: true;
  createdAt: string;
}

export interface AiopClarificationSession {
  clarificationId: string;
  capturedSignalId: string;
  interpretedNeed: string;
  userType: string;
  urgency: NeedUrgency;
  desiredOutcome: string;
  constraints: string[];
  missingAnswers: string[];
  requiresTransactionProof: boolean;
  createdAt: string;
}

export interface AidDepotItem {
  itemId: string;
  name: string;
  category: string;
  allowedUserTypes: string[];
  deliverySurfaces: DeliverySurface[];
  requiresProofPath: boolean;
  active: boolean;
}

export interface PackageAssemblyPlan {
  planId: string;
  clarificationId: string;
  decision: SetupDecision;
  selectedDepotItems: AidDepotItem[];
  deliverySurface: DeliverySurface;
  reasons: string[];
  refusalCodes: string[];
  createdAt: string;
}

export type TsVariant =
  | "TS-PAY"
  | "TS-POP"
  | "TS-PO"
  | "TS-PA"
  | "TS-AUTH"
  | "TS-REC"
  | "TS-DEC"
  | "TS-ETA"
  | "TS-ATA"
  | "TS-TERMS"
  | "TS-LOC"
  | "TS-WGT"
  | "TS-POS"
  | "TS-CUST"
  | "TS-COND"
  | "TS-GENERAL";

export interface TransactionStatement {
  tsId: string;
  variant: TsVariant;
  planId: string;
  statementPurpose: string;
  proofBacked: boolean;
  createdBy: "SETUP_LAYER";
  createdAt: string;
}