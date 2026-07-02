import { runMerchantSoulSeedToPaiSafePbp } from "../engine/merchantLaunchLaneEngine";

function assertPass(label: string, condition: boolean) {
  if (!condition) {
    console.error(`${label}=FAIL`);
    process.exit(1);
  }
  console.log(`${label}=PASS`);
}

const result = runMerchantSoulSeedToPaiSafePbp();

assertPass("MERCHANT_SOULSEED_ENTRY_CREATED", !!result.seed.seedId);
assertPass("MERCHANT_LANE_SELECTED", result.seed.lane === "MERCHANT");
assertPass("TPS_WORKFLOW_SELECTED", result.seed.requestedWorkflow === "TPS_PAI_SAFE_PBP");
assertPass("MERCHANT_PAID_RELATIONSHIP_CREATED", result.paid.inhabited === true && result.paid.visibleState === "PAID_ON");
assertPass("PAI_SAFE_MERCHANT_ACTIVATION_INTENT_CREATED", result.activationIntent.advisoryOnly === true);
assertPass("PBP_RECORD_PREPARED", result.proofBackProtection.merchantFacingProtectionSurface === true);
assertPass("PBP_PENDING_FUNDTRACKER_TRUTH", result.proofBackProtection.status === "PENDING_FUNDTRACKER_TRUTH");
assertPass("FUNDTRACKER_TRUTH_REQUIRED", result.fundTrackerTruth.status === "REQUIRED_NOT_VERIFIED");
assertPass("TPS_RECEIVER_ACCEPTS_PACKET", result.receiverDecision.decision === "ACCEPT");
assertPass("MERCHANT_LIVE_ACTIVATION_RECORD_CREATED", !!result.liveActivationRecord);
assertPass("TS_REFERENCE_CREATED", result.setupPacket.tsReference?.startsWith("TS-REC-") === true);
assertPass("FEES_CAN_BE_CHARGED_PLACEHOLDER", result.activationIntent.protectedTransactionFeeCents > 0);
assertPass("NO_PAYMENT_RAILS", result.activationIntent.requiresFundTrackerTruth === true);
assertPass("NO_WALLET", result.fundTrackerTruth.financialAuthorityGranted === false);
assertPass("NO_AUTHORITY_DRIFT", result.receiverDecision.financialAuthorityGranted === false);

console.log("MERCHANT_SOULSEED_TO_PAI_SAFE_PBP_V1=PASS");

console.log("");
console.log("MERCHANT LAUNCH LANE SAMPLE:");
console.log(JSON.stringify({
  seed: result.seed,
  paid: result.paid,
  activationIntent: result.activationIntent,
  proofBackProtection: result.proofBackProtection,
  fundTrackerTruth: result.fundTrackerTruth,
  setupPacketId: result.setupPacket.packetId,
  receiverDecision: result.receiverDecision.decision,
  liveActivationRecord: result.liveActivationRecord,
  tsReference: result.setupPacket.tsReference
}, null, 2));