import { runReleaseWindowSourceSelectionBridge } from "../src/index.js";

const result = runReleaseWindowSourceSelectionBridge({
  subjectId: "src_002",
  releaseUrgencyScore: 0.5,
  bookingReady: {
    bookingReadyId: "booking_ready_src_002",
    subjectId: "src_002",
    bookingReadyStatus: "BOOKING_READY",
    releaseEligible: true,
    sourcingMode: "isolated",
    bookingReadyReason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  sourceOptions: [
    { sourceId: "iso_a", label: "Isolated A", sourceType: "isolated", available: true, qualityScore: 0.84, marginScore: 0.79, releaseDelayHours: 12 }
  ],
});

if (!result.ok || !result.artifact || result.artifact.selectedSourceType !== "isolated") {
  throw new Error("Expected isolated source success.");
}

console.log("SMOKE_SOURCE_ISOLATED_SUCCESS=PASS");