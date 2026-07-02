import { createSetupProofPacket } from "./createSetupProofPacket";
import { evaluateHandoffReceiver } from "./handoffReceiverEngine";
import type {
  MerchantWorkflowId,
  MerchantSoulSeedEntryPacket,
  MerchantPaidRelationshipRecord,
  PaiSafeMerchantActivationIntent,
  ProofBackProtectionRecord,
  MerchantFundTrackerTruthPlaceholder,
  MerchantLiveActivationRecord,
  MerchantLaunchLaneResult
} from "../contracts/merchantLaunchContracts";

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createMerchantSoulSeedEntryPacket(
  requestedWorkflow: MerchantWorkflowId = "TPS_PAI_SAFE_PBP",
  source: "DOWNLOAD" | "LINK" | "QR" | "DIRECT" | "TPS_SETUP" = "TPS_SETUP"
): MerchantSoulSeedEntryPacket {
  return {
    seedId: id("MERCHANT-SOULSEED"),
    lane: "MERCHANT",
    source,
    requestedWorkflow,
    createdAt: new Date().toISOString()
  };
}

export function runMerchantSoulSeedToPaiSafePbp(): MerchantLaunchLaneResult {
  const seed = createMerchantSoulSeedEntryPacket();

  const paid: MerchantPaidRelationshipRecord = {
    paidRelationshipId: id("MERCHANT-PAID"),
    seedId: seed.seedId,
    lane: "MERCHANT",
    visibleState: "PAID_ON",
    inhabited: true,
    createdAt: new Date().toISOString()
  };

  const activationIntent: PaiSafeMerchantActivationIntent = {
    intentId: id("PAI-SAFE-MERCHANT-INTENT"),
    seedId: seed.seedId,
    workflowId: seed.requestedWorkflow,
    advisoryOnly: true,
    requiresFundTrackerTruth: true,
    proofBackProtectionRequested: true,
    protectedTransactionFeeCents: 250,
    currency: "USD",
    createdAt: new Date().toISOString()
  };

  const proofBackProtection: ProofBackProtectionRecord = {
    pbpRecordId: id("PBP"),
    intentId: activationIntent.intentId,
    status: "PENDING_FUNDTRACKER_TRUTH",
    merchantFacingProtectionSurface: true,
    disputeReadyRecordPrepared: false,
    createdAt: new Date().toISOString()
  };

  const fundTrackerTruth: MerchantFundTrackerTruthPlaceholder = {
    truthRequestId: id("FUNDTRACKER-MERCHANT-TRUTH-REQUEST"),
    intentId: activationIntent.intentId,
    status: "REQUIRED_NOT_VERIFIED",
    financialAuthorityGranted: false,
    createdAt: new Date().toISOString()
  };

  const tsReference = `TS-REC-${activationIntent.intentId}`;

  const setupPacket = createSetupProofPacket({
    capturedSignalId: `CAPTURED-${seed.seedId}`,
    clarificationId: `AIOP-${seed.seedId}`,
    planId: `PLAN-${seed.seedId}`,
    approvedDepotItems: [
      {
        itemId: "AID-TPS-PAI-SAFE-PBP",
        itemType: "MERCHANT_WORKFLOW",
        label: "TPS PAI-SAFE ProofBack Protection Merchant Setup"
      }
    ],
    deliverySurface: "MERCHANT_PORTAL",
    proofRequirements: [
      {
        requirementId: "MERCHANT_PAID_RELATIONSHIP_CREATED",
        label: "Merchant PAID relationship created",
        satisfied: true
      },
      {
        requirementId: "PAI_SAFE_MERCHANT_INTENT_CREATED",
        label: "PAI-SAFE merchant activation intent created",
        satisfied: true
      },
      {
        requirementId: "PBP_RECORD_PREPARED",
        label: "ProofBack Protection record prepared",
        satisfied: true
      },
      {
        requirementId: "FUNDTRACKER_TRUTH_REQUIRED",
        label: "FundTrackerAI truth required before transaction consequence",
        satisfied: true
      }
    ],
    tsReference,
    issuedBy: "MERCHANT_SOULSEED_TO_PAI_SAFE_PBP_V1"
  });

  const receiverDecision = evaluateHandoffReceiver({
    requestId: id("TPS-RECEIVER-REQ"),
    targetReceiver: "TPS",
    packet: setupPacket,
    receivedAt: new Date().toISOString()
  });

  let liveActivationRecord: MerchantLiveActivationRecord | undefined;

  if (receiverDecision.decision === "ACCEPT") {
    liveActivationRecord = {
      liveActivationId: id("MERCHANT-LIVE-ACTIVATION"),
      seedId: seed.seedId,
      paidRelationshipId: paid.paidRelationshipId,
      workflowId: seed.requestedWorkflow,
      receiver: "TPS",
      setupPacketId: setupPacket.packetId,
      receiverDecisionId: receiverDecision.requestId,
      tsReference,
      pbpRecordId: proofBackProtection.pbpRecordId,
      state: "MERCHANT_LIVE_SYSTEM_RECORD_CREATED",
      createdAt: new Date().toISOString()
    };
  }

  return {
    seed,
    paid,
    activationIntent,
    proofBackProtection,
    fundTrackerTruth,
    setupPacket,
    receiverDecision,
    liveActivationRecord,
    finalState: liveActivationRecord ? "LIVE_ACTIVATION_CREATED" : "HOLD"
  };
}