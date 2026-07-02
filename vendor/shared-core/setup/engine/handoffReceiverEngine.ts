import type {
  ReceiverCapabilityProfile,
  HandoffReceiverRequest,
  HandoffReceiverDecision,
  ReceiverRefusalCode
} from "../contracts/handoffReceiverContracts";

export const RECEIVER_CAPABILITIES: ReceiverCapabilityProfile[] = [
  {
    receiver: "LAWAIDAI",
    supportedDeliverySurfaces: ["WEB_DASHBOARD", "PAID_DASHBOARD", "DASHBOARD"],
    acceptsTransactionProofRequired: true,
    requiresTsReference: false
  },
  {
    receiver: "TRAVELFLOWAI",
    supportedDeliverySurfaces: ["MOBILE_GUIDE", "WEB_DASHBOARD", "DASHBOARD"],
    acceptsTransactionProofRequired: true,
    requiresTsReference: true
  },
  {
    receiver: "TPS",
    supportedDeliverySurfaces: ["MERCHANT_PORTAL", "WEB_DASHBOARD", "DASHBOARD"],
    acceptsTransactionProofRequired: true,
    requiresTsReference: true
  },
  {
    receiver: "PAID",
    supportedDeliverySurfaces: ["PAID_DASHBOARD", "DASHBOARD"],
    acceptsTransactionProofRequired: false,
    requiresTsReference: false
  },
  {
    receiver: "SOULSEED",
    supportedDeliverySurfaces: ["SOULSEED_LOCAL_PACKAGE", "LOCAL_CONTAINER", "DOWNLOAD"],
    acceptsTransactionProofRequired: false,
    requiresTsReference: false
  },
  {
    receiver: "SUPPORT",
    supportedDeliverySurfaces: ["SUPPORT_ROUTE", "HOLD_QUEUE", "UNKNOWN"],
    acceptsTransactionProofRequired: false,
    requiresTsReference: false
  }
];

export function evaluateHandoffReceiver(
  request: HandoffReceiverRequest,
  profiles: ReceiverCapabilityProfile[] = RECEIVER_CAPABILITIES
): HandoffReceiverDecision {
  const refusalCodes: ReceiverRefusalCode[] = [];
  const holdReasons: string[] = [];
  const packet = request.packet;

  const profile = profiles.find(p => p.receiver === request.targetReceiver);

  if (!packet) refusalCodes.push("PACKET_MISSING");

  if (!profile) refusalCodes.push("RECEIVER_MISMATCH");

  if (packet && packet.advisoryOnly !== true) {
    refusalCodes.push("PACKET_NOT_ADVISORY");
  }

  if (packet && packet.financialAuthorityGranted !== false) {
    refusalCodes.push("FINANCIAL_AUTHORITY_ATTEMPTED");
  }

  if (packet && packet.approvedDepotItems.length === 0) {
    refusalCodes.push("NO_DEPOT_ITEMS");
  }

  if (packet && packet.setupDecision === "REFUSED") {
    refusalCodes.push("PACKET_REFUSED");
  }

  if (packet && packet.setupDecision === "HOLD") {
    refusalCodes.push("PACKET_HELD");
  }

  if (packet && profile && !profile.supportedDeliverySurfaces.includes(packet.deliverySurface)) {
    refusalCodes.push("DELIVERY_SURFACE_UNSUPPORTED");
  }

  if (packet && profile && packet.requiresTransactionProof && !profile.acceptsTransactionProofRequired) {
    refusalCodes.push("REQUIRES_TRANSACTION_PROOF");
  }

  if (packet && profile && profile.requiresTsReference && !packet.tsReference) {
    refusalCodes.push("TS_REFERENCE_REQUIRED");
  }

  let decision: "ACCEPT" | "HOLD" | "REFUSE" = "ACCEPT";

  if (refusalCodes.length > 0) {
    decision = refusalCodes.includes("PACKET_HELD") ? "HOLD" : "REFUSE";
  }

  if (decision === "HOLD") {
    holdReasons.push("Receiver cannot activate because packet is held or requires completion.");
  }

  return {
    requestId: request.requestId,
    targetReceiver: request.targetReceiver,
    decision,
    acceptedPacketId: decision === "ACCEPT" ? packet.packetId : undefined,
    holdReasons,
    refusalCodes,
    receiverMayActivate: decision === "ACCEPT",
    financialAuthorityGranted: false,
    createdAt: new Date().toISOString()
  };
}