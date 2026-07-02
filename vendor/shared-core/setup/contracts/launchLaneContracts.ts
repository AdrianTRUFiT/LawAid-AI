import type { SetupProofPacket } from "./setupProofPacket";
import type { HandoffReceiverDecision, ReceivingEnvironment } from "./handoffReceiverContracts";

export type LaunchLane = "CONSUMER" | "MERCHANT";

export type ConsumerMindSetId =
  | "LAWAIDAI"
  | "TRAVELFLOWAI";

export type LaunchActivationState =
  | "SEED_CREATED"
  | "LANE_SELECTED"
  | "MINDSET_SELECTED"
  | "PAID_RELATIONSHIP_CREATED"
  | "PAI_SAFE_INTENT_CREATED"
  | "FUNDTRACKER_REQUIRED"
  | "RECEIVER_ACCEPTED"
  | "LIVE_ACTIVATION_CREATED"
  | "TS_PROOF_CREATED"
  | "HOLD"
  | "REFUSED";

export interface ConsumerMindSetCatalogItem {
  mindsetId: ConsumerMindSetId;
  label: string;
  receiver: ReceivingEnvironment;
  painPoint: string;
  paidEligible: true;
  paiSafeRequired: true;
  active: boolean;
}

export interface SoulSeedEntryPacket {
  seedId: string;
  lane: LaunchLane;
  source: "DOWNLOAD" | "LINK" | "QR" | "DIRECT";
  requestedMindSet?: ConsumerMindSetId;
  createdAt: string;
}

export interface PaidRelationshipRecord {
  paidRelationshipId: string;
  seedId: string;
  lane: LaunchLane;
  visibleState: "PAID_ON" | "PAID_OFF";
  inhabited: boolean;
  createdAt: string;
}

export interface PaiSafeActivationIntent {
  intentId: string;
  seedId: string;
  mindsetId: ConsumerMindSetId;
  advisoryOnly: true;
  requiresFundTrackerTruth: true;
  amountCents: number;
  currency: "USD";
  createdAt: string;
}

export interface FundTrackerTruthPlaceholder {
  truthRequestId: string;
  intentId: string;
  status: "REQUIRED_NOT_VERIFIED";
  financialAuthorityGranted: false;
  createdAt: string;
}

export interface LiveActivationRecord {
  liveActivationId: string;
  seedId: string;
  paidRelationshipId: string;
  mindsetId: ConsumerMindSetId;
  receiver: ReceivingEnvironment;
  setupPacketId: string;
  receiverDecisionId: string;
  tsReference: string;
  state: "LIVE_SYSTEM_RECORD_CREATED";
  createdAt: string;
}

export interface ConsumerLaunchLaneResult {
  seed: SoulSeedEntryPacket;
  paid: PaidRelationshipRecord;
  activationIntent: PaiSafeActivationIntent;
  fundTrackerTruth: FundTrackerTruthPlaceholder;
  setupPacket: SetupProofPacket;
  receiverDecision: HandoffReceiverDecision;
  liveActivationRecord?: LiveActivationRecord;
  finalState: LaunchActivationState;
}