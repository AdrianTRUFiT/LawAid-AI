export declare const PC2_ARTIFACT_TYPES: readonly ["PainRecord", "PatternRecord", "ClarityRecord", "CodeIntent"];
export declare const FACT2_ARTIFACT_TYPES: readonly ["FailureRecord", "AnalysisRecord", "CorrectionRecord", "TestedRecord"];
export type Pc2ArtifactType = typeof PC2_ARTIFACT_TYPES[number];
export type Fact2ArtifactType = typeof FACT2_ARTIFACT_TYPES[number];
export type SharedArtifactType = Pc2ArtifactType | Fact2ArtifactType;
