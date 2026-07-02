import {
  reconcileContinuity,
} from "../src/index.js";

const result = reconcileContinuity({
  event: {
    releasedNodeId: "node_007",
    homeBaseId: "home_007",
    continuitySeedVersion: 1,
    restoredAt: new Date().toISOString(),
    packetsToApply: [
      {
        packetId: "p1",
        emittedByNodeId: "node_007",
        targetHomeBaseId: "home_007",
        emittedAt: new Date().toISOString(),
        mode: "store_and_forward",
        continuityState: "recovering",
        payloadHash: "h1",
        replayProtectionNonce: "n1",
      },
      {
        packetId: "p2",
        emittedByNodeId: "node_007",
        targetHomeBaseId: "home_007",
        emittedAt: new Date().toISOString(),
        mode: "lower_bandwidth",
        continuityState: "reconciled",
        payloadHash: "h2",
        replayProtectionNonce: "n2",
      }
    ],
  },
  homeBase: {
    id: "home_007",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_007",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_007",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_007",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
});

if (result.disposition !== "applied" || result.appliedPacketIds.length !== 2) {
  throw new Error("Expected reconciliation applied.");
}

console.log("SMOKE_CONTINUITY_RECONCILE_APPLIED=PASS");