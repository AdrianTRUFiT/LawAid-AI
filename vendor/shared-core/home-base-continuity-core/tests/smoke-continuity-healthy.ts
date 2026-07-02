import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../src/index.js";

const result = evaluateContinuity({
  homeBase: {
    id: "home_001",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_001",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_001",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_001",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "healthy",
  lowerBandwidthAvailable: true,
  minimalSignalAvailable: true,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_001", "home_001"),
  nowIso: new Date().toISOString(),
});

if (result.continuityState !== "connected" || result.fallbackMode !== "none") {
  throw new Error("Expected connected / none.");
}

console.log("SMOKE_CONTINUITY_HEALTHY=PASS");