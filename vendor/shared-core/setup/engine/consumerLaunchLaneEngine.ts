import { createSetupProofPacket } from "./createSetupProofPacket";
import { evaluateHandoffReceiver } from "./handoffReceiverEngine";
import { CONSUMER_MINDSET_CATALOG } from "./consumerMindSetCatalog";
import type {
  ConsumerMindSetId,
  SoulSeedEntryPacket,
  PaidRelationshipRecord,
  PaiSafeActivationIntent,
  FundTrackerTruthPlaceholder,
  LiveActivationRecord,
  ConsumerLaunchLaneResult
} from "../contracts/launchLaneContracts";

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createSoulSeedEntryPacket(
  requestedMindSet: ConsumerMindSetId,
  source: "DOWNLOAD" | "LINK" | "QR" | "DIRECT" = "DOWNLOAD"
): SoulSeedEntryPacket {
  return {
    seedId: id("SOULSEED"),
    lane: "CONSUMER",
    source,
    requestedMindSet,
    createdAt: new Date().toISOString()
  };
}

export function runConsumerSoulSeedToPaidMindSet(
  requestedMindSet: ConsumerMindSetId
): ConsumerLaunchLaneResult {
  const seed = createSoulSeedEntryPacket(requestedMindSet);

  const catalogItem = CONSUMER_MINDSET_CATALOG.find(
    item => item.mindsetId === requestedMindSet && item.active
  );

  if (!catalogItem) {
    throw new Error("MINDSET_NOT_AVAILABLE");
  }

  const paid: PaidRelationshipRecord = {
    paidRelationshipId: id("PAID"),
    seedId: seed.seedId,
    lane: "CONSUMER",
    visibleState: "PAID_ON",
    inhabited: true,
    createdAt: new Date().toISOString()
  };

  const activationIntent: PaiSafeActivationIntent = {
    intentId: id("PAI-SAFE-INTENT"),
    seedId: seed.seedId,
    mindsetId: catalogItem.mindsetId,
    advisoryOnly: true,
    requiresFundTrackerTruth: true,
    amountCents: 1900,
    currency: "USD",
    createdAt: new Date().toISOString()
  };

  const fundTrackerTruth: FundTrackerTruthPlaceholder = {
    truthRequestId: id("FUNDTRACKER-TRUTH-REQUEST"),
    intentId: activationIntent.intentId,
    status: "REQUIRED_NOT_VERIFIED",
    financialAuthorityGranted: false,
    createdAt: new Date().toISOString()
  };

  const tsReference = `TS-AUTH-${activationIntent.intentId}`;

  const setupPacket = createSetupProofPacket({
    capturedSignalId: `CAPTURED-${seed.seedId}`,
    clarificationId: `AIOP-${seed.seedId}`,
    planId: `PLAN-${seed.seedId}`,
    approvedDepotItems: [
      {
        itemId: `AID-${catalogItem.mindsetId}`,
        itemType: "AI_MINDSET",
        label: catalogItem.label
      }
    ],
    deliverySurface: "DASHBOARD",
    proofRequirements: [
      {
        requirementId: "PAID_RELATIONSHIP_CREATED",
        label: "PAID relationship created",
        satisfied: true
      },
      {
        requirementId: "PAI_SAFE_ACTIVATION_INTENT_CREATED",
        label: "PAI-SAFE activation intent created",
        satisfied: true
      },
      {
        requirementId: "FUNDTRACKER_TRUTH_REQUIRED",
        label: "FundTrackerAI truth required before financial consequence",
        satisfied: true
      }
    ],
    tsReference,
    issuedBy: "CONSUMER_SOULSEED_TO_PAID_MINDSETS_V1"
  });

  const receiverDecision = evaluateHandoffReceiver({
    requestId: id("RECEIVER-REQ"),
    targetReceiver: catalogItem.receiver,
    packet: setupPacket,
    receivedAt: new Date().toISOString()
  });

  let liveActivationRecord: LiveActivationRecord | undefined;

  if (receiverDecision.decision === "ACCEPT") {
    liveActivationRecord = {
      liveActivationId: id("LIVE-ACTIVATION"),
      seedId: seed.seedId,
      paidRelationshipId: paid.paidRelationshipId,
      mindsetId: catalogItem.mindsetId,
      receiver: catalogItem.receiver,
      setupPacketId: setupPacket.packetId,
      receiverDecisionId: receiverDecision.requestId,
      tsReference,
      state: "LIVE_SYSTEM_RECORD_CREATED",
      createdAt: new Date().toISOString()
    };
  }

  return {
    seed,
    paid,
    activationIntent,
    fundTrackerTruth,
    setupPacket,
    receiverDecision,
    liveActivationRecord,
    finalState: liveActivationRecord ? "LIVE_ACTIVATION_CREATED" : "HOLD"
  };
}