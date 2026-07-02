import type {
  RawNeedSignal,
  CapturedNeedSignal,
  AiopClarificationSession,
  PackageAssemblyPlan,
  TransactionStatement
} from "./setupContracts";

export type SetupProofPacketEnvironment = "SANDBOX" | "LOCAL" | "CONTROLLED_REVIEW";

export interface SetupProofPacket {
  packetId: string;
  environment: SetupProofPacketEnvironment;
  buildTarget: "AIVA_SETUP_PROOF_PACKET_AND_HANDOFF_V1";
  rawSignal: RawNeedSignal;
  capturedSignal: CapturedNeedSignal;
  clarification: AiopClarificationSession;
  packagePlan: PackageAssemblyPlan;
  transactionStatement?: TransactionStatement;
  boundaryPreservation: {
    diceOnlyCaptured: true;
    aiopOnlyClarified: true;
    aidOnlyMatchedDepot: true;
    noUnauthorizedFulfillment: true;
    noPaymentRails: true;
    noWallet: true;
    noBankIntegration: true;
    noSimulatorPatch: true;
  };
  handoffSummary: string[];
  createdAt: string;
}