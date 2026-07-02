import { randomUUID } from "crypto";
import {
  SetupProofPacket,
  SetupDecisionState,
  SetupRefusalCode,
  ApprovedDepotItem,
  ProofRequirement
} from "../contracts/setupProofPacket";

interface CreatePacketInput {
  capturedSignalId: string;
  clarificationId: string;
  planId: string;

  approvedDepotItems?: ApprovedDepotItem[];

  deliverySurface?:
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

  proofRequirements?: ProofRequirement[];

  holdReasons?: string[];

  refusalCodes?: SetupRefusalCode[];

  tsReference?: string;

  issuedBy?: string;
}

export function createSetupProofPacket(
  input: CreatePacketInput
): SetupProofPacket {

  const approvedDepotItems = input.approvedDepotItems ?? [];
  const proofRequirements = input.proofRequirements ?? [];
  const holdReasons = input.holdReasons ?? [];
  const refusalCodes = input.refusalCodes ?? [];

  let setupDecision: SetupDecisionState = "READY";

  if (refusalCodes.length > 0) {
    setupDecision = "REFUSED";
  } else if (
    holdReasons.length > 0 ||
    proofRequirements.some(r => !r.satisfied)
  ) {
    setupDecision = "HOLD";
  }

  return {
    packetId: randomUUID(),

    capturedSignalId: input.capturedSignalId,
    clarificationId: input.clarificationId,
    planId: input.planId,

    setupDecision,

    approvedDepotItems,

    deliverySurface: input.deliverySurface ?? "UNKNOWN",

    requiresTransactionProof:
      proofRequirements.length > 0,

    proofRequirements,

    holdReasons,

    refusalCodes,

    tsReference: input.tsReference,

    advisoryOnly: true,

    financialAuthorityGranted: false,

    createdAt: new Date().toISOString(),

    issuedBy: input.issuedBy ?? "AIVA_SETUP_PROOF_PACKET_AND_HANDOFF_V1"
  };
}
