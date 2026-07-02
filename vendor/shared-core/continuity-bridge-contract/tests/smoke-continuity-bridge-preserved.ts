import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../../home-base-continuity-core/src/index.js";
import {
  runContinuityBridgeContract,
} from "../src/index.js";

const snapshot = evaluateContinuity({
  homeBase: {
    id: "home_103",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_103",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_103",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_103",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "unavailable",
  lowerBandwidthAvailable: false,
  minimalSignalAvailable: false,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_103", "home_103"),
  nowIso: new Date().toISOString(),
});

const result = runContinuityBridgeContract({
  subjectId: "node_103",
  continuitySnapshot: snapshot,
});

if (!result.ok || !result.artifact || result.artifact.bridgeStatus !== "BRIDGED_PRESERVED") {
  throw new Error("Expected preserved bridge.");
}

console.log("SMOKE_CONTINUITY_BRIDGE_PRESERVED=PASS");