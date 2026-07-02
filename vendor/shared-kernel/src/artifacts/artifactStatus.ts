export const ARTIFACT_STATUSES = [
  "draft",
  "pending",
  "accepted",
  "refused",
  "reviewed",
  "verified"
] as const;

export type ArtifactStatus = typeof ARTIFACT_STATUSES[number];
