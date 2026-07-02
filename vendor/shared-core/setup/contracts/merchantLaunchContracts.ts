import type { SetupProofPacket } from "./setupProofPacket";
import type { HandoffReceiverDecision } from "./handoffReceiverContracts";

export type MerchantWorkflowId =
  | "TPS_PAI_SAFE_PBP";

export interface MerchantSoulSeedEntryPacket {
  seedId: string;
  lane: "MERCHANT";
  source: "DOWNLOAD" | "LINK" | "QR" | "DIRECT" | "TPS_SETUP";
  requestedWorkflow: MerchantWorkflowId;
  createdAt: string;
}

export interface MerchantPaidRelationshipRecord {
  paidRelationshipId: string;
  seedId: string;
  lane: "MERCHANT";
  visibleState: "PAID_ON" | "PAID_OFF";
  inhabited: boolean;
  createdAt: string;
}

export interface PaiSafeMerchantActivationIntent {
  intentId: string;
  seedId: string;
  workflowId: MerchantWorkflowId;
  advisoryOnly: true;
  requiresFundTrackerTruth: true;
  proofBackProtectionRequested: true;
  protectedTransactionFeeCents: number;
  currency: "USD";
  createdAt: string;
}

export interface ProofBackProtectionRecord {
  pbpRecordId: string;
  intentId: string;
  status: "PENDING_FUNDTRACKER_TRUTH";
  merchantFacingProtectionSurface: true;
  disputeReadyRecordPrepared: false;
  createdAt: string;
}

export interface MerchantFundTrackerTruthPlaceholder {
  truthRequestId: string;
  intentId: string;
  status: "REQUIRED_NOT_VERIFIED";
  financialAuthorityGranted: false;
  createdAt: string;
}

export interface MerchantLiveActivationRecord {
  liveActivationId: string;
  seedId: string;
  paidRelationshipId: string;
  workflowId: MerchantWorkflowId;
  receiver: "TPS";
  setupPacketId: string;
  receiverDecisionId: string;
  tsReference: string;
  pbpRecordId: string;
  state: "MERCHANT_LIVE_SYSTEM_RECORD_CREATED";
  createdAt: string;
}

export interface MerchantLaunchLaneResult {
  seed: MerchantSoulSeedEntryPacket;
  paid: MerchantPaidRelationshipRecord;
  activationIntent: PaiSafeMerchantActivationIntent;
  proofBackProtection: ProofBackProtectionRecord;
  fundTrackerTruth: MerchantFundTrackerTruthPlaceholder;
  setupPacket: SetupProofPacket;
  receiverDecision: HandoffReceiverDecision;
  liveActivationRecord?: MerchantLiveActivationRecord;
  finalState: "LIVE_ACTIVATION_CREATED" | "HOLD" | "REFUSED";
}