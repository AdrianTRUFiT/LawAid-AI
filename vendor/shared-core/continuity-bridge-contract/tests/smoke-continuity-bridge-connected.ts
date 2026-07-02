import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../../home-base-continuity-core/src/index.js";
import {
  runContinuityBridgeContract,
} from "../src/index.js";

const snapshot = evaluateContinuity({
  homeBase: {
    id: "home_101",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_101",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_101",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_101",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "healthy",
  lowerBandwidthAvailable: true,
  minimalSignalAvailable: true,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_101", "home_101"),
  nowIso: new Date().toISOString(),
});

const result = runContinuityBridgeContract({
  subjectId: "node_101",
  continuitySnapshot: snapshot,
});

if (!result.ok || !result.artifact || result.artifact.bridgeStatus !== "BRIDGED_CONNECTED") {
  throw new Error("Expected connected bridge.");
}

console.log("SMOKE_CONTINUITY_BRIDGE_CONNECTED=PASS");