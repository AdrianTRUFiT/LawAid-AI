export const ARTIFACT_TYPES = {
  RAW_SIGNAL: "Raw Signal",
  CAPTURED_SIGNAL: "Captured Signal",
  VERIFIED_OPPORTUNITY: "Verified Opportunity",
  ACTIVATED_TRANSACTION_STATE: "Activated Transaction State",
  LIVE_SYSTEM_RECORD: "Live System Record"
};

export function isKnownArtifactType(type) {
  return Object.values(ARTIFACT_TYPES).includes(type);
}
