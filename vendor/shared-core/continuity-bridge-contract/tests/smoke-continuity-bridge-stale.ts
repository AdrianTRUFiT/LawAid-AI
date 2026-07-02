import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../../home-base-continuity-core/src/index.js";
import {
  runContinuityBridgeContract,
} from "../src/index.js";

const snapshot = evaluateContinuity({
  homeBase: {
    id: "home_104",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_104",
    continuitySeedVersion: 2,
  },
  releasedNode: {
    id: "node_104",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_104",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "healthy",
  lowerBandwidthAvailable: false,
  minimalSignalAvailable: false,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_104", "home_104"),
  nowIso: new Date().toISOString(),
});

const result = runContinuityBridgeContract({
  subjectId: "node_104",
  continuitySnapshot: snapshot,
});

if (!result.ok || !result.artifact || result.artifact.requiresAttention !== true || !result.artifact.sourceRefusalCodes.includes("STALE_RELATIONSHIP")) {
  throw new Error("Expected stale relationship attention bridge.");
}

console.log("SMOKE_CONTINUITY_BRIDGE_STALE=PASS");