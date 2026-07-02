import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../src/index.js";

const result = evaluateContinuity({
  homeBase: {
    id: "home_005",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_005",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_005",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_005",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "unavailable",
  lowerBandwidthAvailable: false,
  minimalSignalAvailable: false,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_005", "home_005"),
  nowIso: new Date().toISOString(),
});

if (result.continuityState !== "store_and_forward" || result.fallbackMode !== "store_and_forward") {
  throw new Error("Expected store-and-forward fallback.");
}

console.log("SMOKE_CONTINUITY_STORE_AND_FORWARD=PASS");