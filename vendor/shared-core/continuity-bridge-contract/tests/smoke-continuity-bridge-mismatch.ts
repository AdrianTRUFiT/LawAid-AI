import {
  createLocalPreservedState,
  evaluateContinuity,
} from "../../home-base-continuity-core/src/index.js";
import {
  runContinuityBridgeContract,
} from "../src/index.js";

const snapshot = evaluateContinuity({
  homeBase: {
    id: "home_105",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_105",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_105",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_105",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
  preferredChannel: "healthy",
  lowerBandwidthAvailable: true,
  minimalSignalAvailable: true,
  relayCandidate: null,
  storedLocalState: createLocalPreservedState("node_105", "home_105"),
  nowIso: new Date().toISOString(),
});

const result = runContinuityBridgeContract({
  subjectId: "wrong_node",
  continuitySnapshot: snapshot,
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_CONTINUITY_BRIDGE_MISMATCH=PASS");