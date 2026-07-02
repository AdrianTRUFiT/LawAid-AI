import { runReleaseWindowSourceSelectionBridge } from "../src/index.js";

const result = runReleaseWindowSourceSelectionBridge({
  subjectId: "src_005",
  releaseUrgencyScore: 0.5,
  bookingReady: {
    bookingReadyId: "booking_ready_src_005",
    subjectId: "wrong_src",
    bookingReadyStatus: "BOOKING_READY",
    releaseEligible: true,
    sourcingMode: "isolated",
    bookingReadyReason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  sourceOptions: [
    { sourceId: "iso_a", label: "Isolated A", sourceType: "isolated", available: true, qualityScore: 0.8, marginScore: 0.8, releaseDelayHours: 2 }
  ],
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_SOURCE_SUBJECT_MISMATCH=PASS");