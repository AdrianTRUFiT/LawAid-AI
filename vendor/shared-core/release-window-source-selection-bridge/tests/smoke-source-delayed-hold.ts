import { runReleaseWindowSourceSelectionBridge } from "../src/index.js";

const result = runReleaseWindowSourceSelectionBridge({
  subjectId: "src_003",
  releaseUrgencyScore: 0.3,
  bookingReady: {
    bookingReadyId: "booking_ready_src_003",
    subjectId: "src_003",
    bookingReadyStatus: "BOOKING_READY",
    releaseEligible: true,
    sourcingMode: "pooled",
    bookingReadyReason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  sourceOptions: [
    { sourceId: "pool_c", label: "Pool C", sourceType: "pooled", available: true, qualityScore: 0.9, marginScore: 0.85, releaseDelayHours: 36 }
  ],
});

if (!result.ok || !result.artifact || result.artifact.sourceSelectionStatus !== "SOURCE_HELD" || result.artifact.releaseWindowClass !== "delayed") {
  throw new Error("Expected delayed release hold.");
}

console.log("SMOKE_SOURCE_DELAYED_HOLD=PASS");