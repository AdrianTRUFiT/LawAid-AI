export const EXISTENCE_CLASSES = [
  "canonical_doctrine",
  "specification_defined",
  "structural_placeholder",
  "partial_implementation",
  "production_implementation",
  "historical_lineage",
  "missing",
  "unknown",
] as const;

export type ExistenceClass = (typeof EXISTENCE_CLASSES)[number];

export const GAP_STATUSES = [
  "present_and_aligned",
  "present_but_weak",
  "present_but_drifted",
  "present_but_unmapped",
  "missing",
  "unclear_requires_reentry_verification",
] as const;

export type GapStatus = (typeof GAP_STATUSES)[number];