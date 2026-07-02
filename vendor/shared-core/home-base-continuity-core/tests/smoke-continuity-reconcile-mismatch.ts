import {
  reconcileContinuity,
} from "../src/index.js";

const result = reconcileContinuity({
  event: {
    releasedNodeId: "node_008",
    homeBaseId: "wrong_home",
    continuitySeedVersion: 1,
    restoredAt: new Date().toISOString(),
    packetsToApply: [
      {
        packetId: "p1",
        emittedByNodeId: "node_008",
        targetHomeBaseId: "wrong_home",
        emittedAt: new Date().toISOString(),
        mode: "store_and_forward",
        continuityState: "recovering",
        payloadHash: "h1",
        replayProtectionNonce: "n1",
      }
    ],
  },
  homeBase: {
    id: "home_008",
    role: "home_base",
    label: "Home",
    trustAnchorId: "anchor_008",
    continuitySeedVersion: 1,
  },
  releasedNode: {
    id: "node_008",
    role: "released_node",
    label: "Node",
    homeBaseId: "home_008",
    continuitySeedVersion: 1,
    lastKnownHeartbeatAt: null,
  },
});

if (result.disposition !== "refused" || result.reason !== "HOME_BASE_MISMATCH") {
  throw new Error("Expected mismatch refusal.");
}

console.log("SMOKE_CONTINUITY_RECONCILE_MISMATCH=PASS");