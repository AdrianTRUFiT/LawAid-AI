import { runReleaseWindowSourceSelectionBridge } from "../src/index.js";

const result = runReleaseWindowSourceSelectionBridge({
  subjectId: "src_004",
  releaseUrgencyScore: 0.9,
  bookingReady: {
    bookingReadyId: "booking_ready_src_004",
    subjectId: "src_004",
    bookingReadyStatus: "BOOKING_READY",
    releaseEligible: true,
    sourcingMode: "pooled",
    bookingReadyReason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  sourceOptions: [
    { sourceId: "iso_only", label: "Isolated Only", sourceType: "isolated", available: true, qualityScore: 0.9, marginScore: 0.9, releaseDelayHours: 1 }
  ],
});

if (result.ok || result.refusal?.refusalCode !== "NO_ELIGIBLE_SOURCE") {
  throw new Error("Expected no eligible source refusal.");
}

console.log("SMOKE_SOURCE_NO_ELIGIBLE_REFUSAL=PASS");