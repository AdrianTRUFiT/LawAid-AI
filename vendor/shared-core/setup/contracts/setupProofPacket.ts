export type SetupDecisionState =
  | "READY"
  | "HOLD"
  | "REFUSED";

export type SetupRefusalCode =
  | "SIGNAL_MISSING"
  | "INTAKE_INCOMPLETE"
  | "NO_MATCHED_PACKAGE"
  | "UNAUTHORIZED_COMBINATION"
  | "DELIVERY_SURFACE_INVALID"
  | "PROOF_REQUIREMENTS_UNMET";

export interface ProofRequirement {
  requirementId: string;
  label: string;
  satisfied: boolean;
}

export interface ApprovedDepotItem {
  itemId: string;
  itemType: string;
  label: string;
}

export interface SetupProofPacket {
  packetId: string;

  capturedSignalId: string;
  clarificationId: string;
  planId: string;

  setupDecision: SetupDecisionState;

  approvedDepotItems: ApprovedDepotItem[];

  deliverySurface:
    | "WEB"
    | "DESKTOP"
    | "MOBILE"
    | "LOCAL_CONTAINER"
    | "DASHBOARD"
    | "MERCHANT_PORTAL"
    | "PAID_DASHBOARD"
    | "WEB_DASHBOARD"
    | "MOBILE_GUIDE"
    | "SOULSEED_LOCAL_PACKAGE"
    | "SUPPORT_ROUTE"
    | "HOLD_QUEUE"
    | "DOWNLOAD"
    | "UNKNOWN";

  requiresTransactionProof: boolean;

  proofRequirements: ProofRequirement[];

  holdReasons: string[];

  refusalCodes: SetupRefusalCode[];

  tsReference?: string;

  advisoryOnly: true;

  financialAuthorityGranted: false;

  createdAt: string;

  issuedBy: string;
}
