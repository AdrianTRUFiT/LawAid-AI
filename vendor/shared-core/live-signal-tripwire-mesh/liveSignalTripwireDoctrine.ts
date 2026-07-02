export const LIVE_SIGNAL_TRIPWIRE_MESH_DOCTRINE = {
  name: "Live Signal Tripwire Mesh",
  class: "MULTI_SEAM_EARLY_WARNING_AND_CORRELATION_LAYER",
  purpose:
    "Detect quiet cross-layer pressure before it becomes a breach by correlating actual signals across seams while preserving the rule that forecasts are not evidence.",
  operatingLaw:
    "One weak signal may be noise. Multiple related signals across independent seams become pre-breach pressure. Forecast-only pressure may prepare watch posture, but cannot hold or refuse a transaction without actual signal.",
  strategicPosture:
    "Fraud aims at static seams. The mesh watches the spaces between seams so the system moves before the attack has a stable target.",
  boundary: {
    tripwireMeshIsNotPaymentAuthority: true,
    tripwireMeshIsNotTransactionTruth: true,
    tripwireMeshIsNotCustodyTransfer: true,
    tripwireMeshIsNotRuntimeActivation: true,
    forecastIsNotEvidence: true,
    actualSignalRequiredForHoldOrRefusal: true,
    fundTrackerAIRemainsTransactionTruth: true
  }
} as const;
