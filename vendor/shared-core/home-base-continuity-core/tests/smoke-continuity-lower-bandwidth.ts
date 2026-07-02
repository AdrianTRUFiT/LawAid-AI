import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../src/index.js";

const result = evaluateContinuity({
  homeBase: {
    id: "home_002",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_002",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_002",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_002",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "degraded",
  lowerBandwidthAvailable: true,
  minimalSignalAvailable: false,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_002", "home_002"),
  nowIso: new Date().toISOString(),
});

if (result.continuityState !== "fallback_active" || result.fallbackMode !== "lower_bandwidth") {
  throw new Error("Expected lower-bandwidth fallback.");
}

console.log("SMOKE_CONTINUITY_LOWER_BANDWIDTH=PASS");