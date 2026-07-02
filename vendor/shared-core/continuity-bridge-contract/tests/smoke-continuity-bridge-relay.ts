import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../../home-base-continuity-core/src/index.js";
import {
  runContinuityBridgeContract,
} from "../src/index.js";

const snapshot = evaluateContinuity({
  homeBase: {
    id: "home_102",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_102",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_102",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_102",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "unavailable",
  lowerBandwidthAvailable: false,
  minimalSignalAvailable: false,
  relayCandidate: {
    participantNodeId: "relay_102",
    relayEnabled: true,
    canRelayForHomeBaseIds: ["home_102"],
    expiresAt: null,
  },
  storedLocalState: createLocalPreservedState("node_102", "home_102"),
  nowIso: new Date().toISOString(),
});

const result = runContinuityBridgeContract({
  subjectId: "node_102",
  continuitySnapshot: snapshot,
});

if (!result.ok || !result.artifact || result.artifact.bridgeStatus !== "BRIDGED_RELAYED" || result.artifact.relayUsed !== true) {
  throw new Error("Expected relayed bridge.");
}

console.log("SMOKE_CONTINUITY_BRIDGE_RELAY=PASS");