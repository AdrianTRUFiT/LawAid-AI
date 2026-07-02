import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { runConsumerSoulSeedToPaidMindSet } from "./consumerLaunchLaneEngine";
import { runMerchantSoulSeedToPaiSafePbp } from "./merchantLaunchLaneEngine";
import type { AivaLaunchRecordExport } from "../contracts/launchRecordExportContracts";

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function exportConsumerLaunchRecord(): AivaLaunchRecordExport {
  const result = runConsumerSoulSeedToPaidMindSet("LAWAIDAI");

  if (!result.liveActivationRecord) {
    throw new Error("CONSUMER_LIVE_ACTIVATION_REQUIRED");
  }

  return {
    exportId: id("LAUNCH-EXPORT-CONSUMER"),
    lane: "CONSUMER",
    sourceRecordId: result.seed.seedId,
    paidRelationshipId: result.paid.paidRelationshipId,
    activationIntentId: result.activationIntent.intentId,
    setupPacketId: result.setupPacket.packetId,
    receiverDecision: result.receiverDecision.decision,
    liveActivationId: result.liveActivationRecord.liveActivationId,
    tsReference: result.setupPacket.tsReference ?? "",
    fundTrackerRequired: true,
    financialAuthorityGranted: false,
    paymentRailsConnected: false,
    walletCreated: false,
    createdAt: new Date().toISOString(),
    issuedBy: "AIVA_LAUNCH_RECORD_EXPORT_V1"
  };
}

export function exportMerchantLaunchRecord(): AivaLaunchRecordExport {
  const result = runMerchantSoulSeedToPaiSafePbp();

  if (!result.liveActivationRecord) {
    throw new Error("MERCHANT_LIVE_ACTIVATION_REQUIRED");
  }

  return {
    exportId: id("LAUNCH-EXPORT-MERCHANT"),
    lane: "MERCHANT",
    sourceRecordId: result.seed.seedId,
    paidRelationshipId: result.paid.paidRelationshipId,
    activationIntentId: result.activationIntent.intentId,
    setupPacketId: result.setupPacket.packetId,
    receiverDecision: result.receiverDecision.decision,
    liveActivationId: result.liveActivationRecord.liveActivationId,
    tsReference: result.setupPacket.tsReference ?? "",
    fundTrackerRequired: true,
    financialAuthorityGranted: false,
    paymentRailsConnected: false,
    walletCreated: false,
    createdAt: new Date().toISOString(),
    issuedBy: "AIVA_LAUNCH_RECORD_EXPORT_V1"
  };
}

export function writeLaunchRecord(record: AivaLaunchRecordExport): string {
  const dir = join(process.cwd(), "records", "launch");
  mkdirSync(dir, { recursive: true });

  const file = join(dir, `${record.exportId}.json`);
  writeFileSync(file, JSON.stringify(record, null, 2), "utf8");

  return file;
}