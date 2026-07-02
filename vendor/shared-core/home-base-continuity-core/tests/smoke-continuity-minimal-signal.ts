import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../src/index.js";

const result = evaluateContinuity({
  homeBase: {
    id: "home_003",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_003",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_003",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_003",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "degraded",
  lowerBandwidthAvailable: false,
  minimalSignalAvailable: true,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_003", "home_003"),
  nowIso: new Date().toISOString(),
});

if (result.continuityState !== "fallback_active" || result.fallbackMode !== "minimal_signal") {
  throw new Error("Expected minimal-signal fallback.");
}

console.log("SMOKE_CONTINUITY_MINIMAL_SIGNAL=PASS");