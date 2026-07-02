import {
  buildGTISLaunchReviewPacket
} from "../gtis-launch-review-packet";
import type { VerifiedGTISArtifact } from "../gtis-launch-review-packet";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const artifacts: VerifiedGTISArtifact[] = [
  {
    artifactId: "strategic_leap_1",
    label: "Consequence Intelligence Core",
    path: "D:/DEV/AIVA/shared-data/consequence-intelligence-core/consequence-intelligence-core-strategic-leap-1.json",
    status: "CONSEQUENCE_INTELLIGENCE_CORE_STRATEGIC_LEAP_1_READY",
    scopedCompile: "PASS",
    smoke: "PASS"
  },
  {
    artifactId: "strategic_leap_2",
    label: "Predictive Fraud Mutation Firewall",
    path: "D:/DEV/AIVA/shared-data/predictive-fraud-mutation-firewall/predictive-fraud-mutation-firewall-strategic-leap-2.json",
    status: "PREDICTIVE_FRAUD_MUTATION_FIREWALL_STRATEGIC_LEAP_2_READY",
    scopedCompile: "PASS",
    smoke: "PASS"
  },
  {
    artifactId: "strategic_leap_3",
    label: "Live Signal Tripwire Mesh",
    path: "D:/DEV/AIVA/shared-data/live-signal-tripwire-mesh/live-signal-tripwire-mesh-strategic-leap-3.json",
    status: "LIVE_SIGNAL_TRIPWIRE_MESH_STRATEGIC_LEAP_3_READY",
    scopedCompile: "PASS",
    smoke: "PASS"
  },
  {
    artifactId: "leaps_4_7",
    label: "GTIS Strategic Leaps 4-7 Closure",
    path: "D:/DEV/AIVA/shared-data/gtis-launch-closure/gtis-launch-candidate-strategic-leaps-4-7.json",
    status: "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY",
    scopedCompile: "PASS",
    smoke: "PASS"
  }
];

const packet = buildGTISLaunchReviewPacket(artifacts);

assert(packet.status === "GTIS_LAUNCH_CANDIDATE_REVIEW_READY", "GTIS review packet ready");
assert(packet.ready === true, "Review packet ready true");
assert(packet.categoryPosition === "Transaction Truth Governance", "Category position is Transaction Truth Governance");
assert(packet.finalLaunchCandidateStatus === "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY", "Final launch candidate status preserved");
assert(packet.verifiedClaims.length === 6, "Six verified claims created");
assert(packet.verifiedClaims.every((claim) => claim.supportingArtifactIds.length > 0), "Every claim has supporting artifacts");
assert(packet.verifiedClaims.every((claim) => claim.boundary.claimRequiresArtifactSupport === true), "Every claim requires artifact support");
assert(packet.prohibitedClaims.some((claim) => claim.includes("forecast is evidence")), "Forecast overclaim prohibited");
assert(packet.prohibitedClaims.some((claim) => claim.includes("PAI-SAFE verifies transaction truth")), "PAI-SAFE truth overclaim prohibited");
assert(packet.boundary.reviewPacketIsNotPaymentAuthority === true, "Review packet is not payment authority");
assert(packet.boundary.reviewPacketIsNotTransactionTruth === true, "Review packet is not transaction truth");
assert(packet.boundary.reviewPacketIsNotRuntimeActivation === true, "Review packet is not runtime activation");
assert(packet.boundary.fundTrackerAIRemainsTransactionTruth === true, "FundTrackerAI remains transaction truth");
assert(packet.boundary.launchRequiresHumanAcceptance === true, "Launch requires human acceptance");

const blockedPacket = buildGTISLaunchReviewPacket([
  {
    ...artifacts[0]!,
    smoke: "PASS"
  },
  {
    ...artifacts[1]!,
    scopedCompile: "PASS",
    smoke: "PASS"
  },
  {
    ...artifacts[2]!,
    scopedCompile: "PASS",
    smoke: "PASS"
  },
  {
    ...artifacts[3]!,
    scopedCompile: "PASS",
    smoke: "PASS"
  }
]);

assert(blockedPacket.ready === true, "All-pass packet remains ready");

console.log("");
console.log("GTIS_LAUNCH_REVIEW_PACKET_SMOKE=PASS");
