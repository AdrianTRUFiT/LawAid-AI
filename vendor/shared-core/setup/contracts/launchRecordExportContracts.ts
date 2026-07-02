export type LaunchRecordLane = "CONSUMER" | "MERCHANT";

export interface AivaLaunchRecordExport {
  exportId: string;
  lane: LaunchRecordLane;
  sourceRecordId: string;
  paidRelationshipId: string;
  activationIntentId: string;
  setupPacketId: string;
  receiverDecision: "ACCEPT" | "HOLD" | "REFUSE";
  liveActivationId?: string;
  tsReference: string;
  fundTrackerRequired: true;
  financialAuthorityGranted: false;
  paymentRailsConnected: false;
  walletCreated: false;
  createdAt: string;
  issuedBy: "AIVA_LAUNCH_RECORD_EXPORT_V1";
}