import { runConsumerSoulSeedToPaidMindSet } from "../engine/consumerLaunchLaneEngine";

function assertPass(label: string, condition: boolean) {
  if (!condition) {
    console.error(`${label}=FAIL`);
    process.exit(1);
  }
  console.log(`${label}=PASS`);
}

const lawAid = runConsumerSoulSeedToPaidMindSet("LAWAIDAI");

assertPass("SOULSEED_ENTRY_CREATED", !!lawAid.seed.seedId);
assertPass("CONSUMER_LANE_SELECTED", lawAid.seed.lane === "CONSUMER");
assertPass("MINDSET_SELECTED", lawAid.seed.requestedMindSet === "LAWAIDAI");
assertPass("PAID_RELATIONSHIP_CREATED", lawAid.paid.inhabited === true && lawAid.paid.visibleState === "PAID_ON");
assertPass("PAI_SAFE_ACTIVATION_INTENT_CREATED", lawAid.activationIntent.advisoryOnly === true);
assertPass("FUNDTRACKER_TRUTH_REQUIRED", lawAid.fundTrackerTruth.status === "REQUIRED_NOT_VERIFIED");
assertPass("RECEIVER_ACCEPTS_PACKET", lawAid.receiverDecision.decision === "ACCEPT");
assertPass("LIVE_ACTIVATION_RECORD_CREATED", !!lawAid.liveActivationRecord);
assertPass("TS_REFERENCE_CREATED", lawAid.setupPacket.tsReference?.startsWith("TS-AUTH-") === true);
assertPass("NO_PAYMENT_RAILS", lawAid.activationIntent.requiresFundTrackerTruth === true);
assertPass("NO_WALLET", lawAid.fundTrackerTruth.financialAuthorityGranted === false);
assertPass("NO_AUTHORITY_DRIFT", lawAid.receiverDecision.financialAuthorityGranted === false);

const travel = runConsumerSoulSeedToPaidMindSet("TRAVELFLOWAI");

assertPass("TRAVELFLOW_MINDSET_SELECTED", travel.seed.requestedMindSet === "TRAVELFLOWAI");
assertPass("TRAVELFLOW_RECEIVER_ACCEPTS_PACKET", travel.receiverDecision.decision === "ACCEPT");
assertPass("TRAVELFLOW_LIVE_ACTIVATION_CREATED", !!travel.liveActivationRecord);

console.log("CONSUMER_SOULSEED_TO_PAID_MINDSETS_V1=PASS");

console.log("");
console.log("CONSUMER LAUNCH LANE SAMPLE:");
console.log(JSON.stringify({
  seed: lawAid.seed,
  paid: lawAid.paid,
  activationIntent: lawAid.activationIntent,
  fundTrackerTruth: lawAid.fundTrackerTruth,
  setupPacketId: lawAid.setupPacket.packetId,
  receiverDecision: lawAid.receiverDecision.decision,
  liveActivationRecord: lawAid.liveActivationRecord,
  tsReference: lawAid.setupPacket.tsReference
}, null, 2));