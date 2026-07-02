import type { SetupProofPacket } from "./setupProofPacket";

export type ReceivingEnvironment =
  | "LAWAIDAI"
  | "TRAVELFLOWAI"
  | "TPS"
  | "PAID"
  | "SOULSEED"
  | "SUPPORT"
  | "UNKNOWN";

export type ReceiverDecision =
  | "ACCEPT"
  | "HOLD"
  | "REFUSE";

export type ReceiverRefusalCode =
  | "PACKET_MISSING"
  | "PACKET_NOT_ADVISORY"
  | "FINANCIAL_AUTHORITY_ATTEMPTED"
  | "DELIVERY_SURFACE_UNSUPPORTED"
  | "NO_DEPOT_ITEMS"
  | "RECEIVER_MISMATCH"
  | "PACKET_REFUSED"
  | "PACKET_HELD"
  | "TS_REFERENCE_REQUIRED"
  | "REQUIRES_TRANSACTION_PROOF";

export interface ReceiverCapabilityProfile {
  receiver: ReceivingEnvironment;
  supportedDeliverySurfaces: string[];
  acceptsTransactionProofRequired: boolean;
  requiresTsReference: boolean;
}

export interface HandoffReceiverRequest {
  requestId: string;
  targetReceiver: ReceivingEnvironment;
  packet: SetupProofPacket;
  receivedAt: string;
}

export interface HandoffReceiverDecision {
  requestId: string;
  targetReceiver: ReceivingEnvironment;
  decision: ReceiverDecision;
  acceptedPacketId?: string;
  holdReasons: string[];
  refusalCodes: ReceiverRefusalCode[];
  receiverMayActivate: boolean;
  financialAuthorityGranted: false;
  createdAt: string;
}