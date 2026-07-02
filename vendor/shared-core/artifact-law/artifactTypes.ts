export const ARTIFACT_TYPES = {
  RAW_SIGNAL: "Raw Signal",
  CAPTURED_SIGNAL: "Captured Signal",
  VERIFIED_OPPORTUNITY: "Verified Opportunity",
  ACTIVATED_TRANSACTION_STATE: "Activated Transaction State",
  LIVE_SYSTEM_RECORD: "Live System Record"
};

export const ARTIFACT_SEQUENCE = [
  ARTIFACT_TYPES.RAW_SIGNAL,
  ARTIFACT_TYPES.CAPTURED_SIGNAL,
  ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
  ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
  ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
];

export function isKnownArtifactType(type) {
  return Object.values(ARTIFACT_TYPES).includes(type);
}
