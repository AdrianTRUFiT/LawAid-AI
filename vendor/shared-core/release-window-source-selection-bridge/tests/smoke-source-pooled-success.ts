import { runReleaseWindowSourceSelectionBridge } from "../src/index.js";

const result = runReleaseWindowSourceSelectionBridge({
  subjectId: "src_001",
  releaseUrgencyScore: 0.9,
  bookingReady: {
    bookingReadyId: "booking_ready_src_001",
    subjectId: "src_001",
    bookingReadyStatus: "BOOKING_READY",
    releaseEligible: true,
    sourcingMode: "pooled",
    bookingReadyReason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  sourceOptions: [
    { sourceId: "pool_a", label: "Pool A", sourceType: "pooled", available: true, qualityScore: 0.88, marginScore: 0.82, releaseDelayHours: 1 },
    { sourceId: "pool_b", label: "Pool B", sourceType: "pooled", available: true, qualityScore: 0.7, marginScore: 0.7, releaseDelayHours: 4 }
  ],
});

if (!result.ok || !result.artifact || result.artifact.sourceSelectionStatus !== "SOURCE_SELECTED" || result.artifact.selectedSourceType !== "pooled") {
  throw new Error("Expected pooled source success.");
}

console.log("SMOKE_SOURCE_POOLED_SUCCESS=PASS");