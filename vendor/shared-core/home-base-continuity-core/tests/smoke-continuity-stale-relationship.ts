import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../src/index.js";

const result = evaluateContinuity({
  homeBase: {
    id: "home_006",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_006",
    continuitySeedVersion: 2,
  },
  releasedNode: {
    id: "node_006",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_006",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "healthy",
  lowerBandwidthAvailable: false,
  minimalSignalAvailable: false,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_006", "home_006"),
  nowIso: new Date().toISOString(),
});

if (!result.refusalCodes.includes("STALE_RELATIONSHIP")) {
  throw new Error("Expected stale relationship signal.");
}

console.log("SMOKE_CONTINUITY_STALE_RELATIONSHIP=PASS");