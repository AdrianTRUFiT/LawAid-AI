import type { TrustedTransactionFinalState } from "./trustedTransactionContracts";

export type MicContainerType =
  | "PAYMENT_REFERENCE"
  | "RECEIPT_REFERENCE"
  | "CONTRACT_REFERENCE"
  | "SIGNATURE_REFERENCE"
  | "DEED_REFERENCE"
  | "PAYROLL_INSTRUCTION_REFERENCE"
  | "FUNDING_CONDITION_REFERENCE"
  | "ACCESS_PERMISSION_REFERENCE"
  | "SETTLEMENT_INSTRUCTION_REFERENCE"
  | "PROOF_PACKET_REFERENCE";

export type MovingIntelligenceContainer = {
  micId: string;
  trustedTransactionRequestId: string;
  containerType: MicContainerType;
  containedReferences: string[];
  authorityClaims: string[];
  proofReferences: string[];
  routePlanId?: string;
  currentCheckpoint?: string;
  motionState: TrustedTransactionFinalState;
  createdAt: string;
  updatedAt: string;
  integrityHash: string;
  carriesAssetCustody: false;
  carriesVerifiedAuthorityReference: true;
};

export function assertMicBoundary(mic: MovingIntelligenceContainer): true {
  if (mic.carriesAssetCustody !== false) {
    throw new Error("MIC_BOUNDARY_BREACH: MIC must not carry asset custody.");
  }
  if (mic.carriesVerifiedAuthorityReference !== true) {
    throw new Error("MIC_BOUNDARY_BREACH: MIC must carry verified authority reference.");
  }
  return true;
}
