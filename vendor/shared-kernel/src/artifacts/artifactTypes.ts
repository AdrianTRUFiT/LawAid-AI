export const PC2_ARTIFACT_TYPES = [
  "PainRecord",
  "PatternRecord",
  "ClarityRecord",
  "CodeIntent"
] as const;

export const FACT2_ARTIFACT_TYPES = [
  "FailureRecord",
  "AnalysisRecord",
  "CorrectionRecord",
  "TestedRecord"
] as const;

export type Pc2ArtifactType = typeof PC2_ARTIFACT_TYPES[number];
export type Fact2ArtifactType = typeof FACT2_ARTIFACT_TYPES[number];
export type SharedArtifactType = Pc2ArtifactType | Fact2ArtifactType;
