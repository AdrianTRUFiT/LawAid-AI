import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../src/index.js";

const result = evaluateContinuity({
  homeBase: {
    id: "home_004",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_004",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_004",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_004",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "unavailable",
  lowerBandwidthAvailable: false,
  minimalSignalAvailable: false,
  relayCandidate: {
    participantNodeId: "relay_004",
    relayEnabled: true,
    canRelayForHomeBaseIds: ["home_004"],
    expiresAt: null,
  },
  storedLocalState: createLocalPreservedState("node_004", "home_004"),
  nowIso: new Date().toISOString(),
});

if (result.continuityState !== "relayed" || result.fallbackMode !== "relay_mesh" || result.relayUsed !== true) {
  throw new Error("Expected relay-mesh fallback.");
}

console.log("SMOKE_CONTINUITY_RELAY=PASS");