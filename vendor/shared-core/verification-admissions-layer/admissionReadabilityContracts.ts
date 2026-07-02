export type AdmissionReadabilityState =
  | "ADMISSION_READABLE"
  | "ADMISSION_UNREADABLE";

export type AdmissionNormalizationState =
  | "ADMISSION_NORMALIZED"
  | "ADMISSION_NOT_NORMALIZED";

export type AdmissionDivergenceState =
  | "ADMISSION_DIVERGENCE_DETECTED"
  | "ADMISSION_NO_DIVERGENCE";

export type AdmissionReasonCode =
  | "VISIBLE_TEXT_PRESENT"
  | "VISIBLE_TEXT_MISSING"
  | "PRINTABLE_RATIO_TOO_LOW"
  | "NORMALIZATION_CHANGED_TEXT"
  | "NORMALIZATION_NO_CHANGE"
  | "NEAR_DUPLICATE_DIVERGENCE"
  | "NO_NEAR_DUPLICATE_DIVERGENCE";

export type AdmissionFingerprint = {
  rawHash: string;
  normalizedHash: string;
  tokenSetHash: string;
  visibleCharCount: number;
  printableRatio: number;
  tokenCount: number;
};

export type AdmissionNormalizationArtifact = {
  artifactType: "ADMISSION_NORMALIZATION_ARTIFACT";
  generatedAt: string;
  sourceFilePath: string;
  normalizedFilePath: string;
  linkage: {
    sourceFilePath: string;
    normalizedFilePath: string;
  };
  readabilityState: AdmissionReadabilityState;
  normalizationState: AdmissionNormalizationState;
  divergenceState: AdmissionDivergenceState;
  reasonCodes: AdmissionReasonCode[];
  originalTextLength: number;
  normalizedTextLength: number;
  fingerprints: AdmissionFingerprint;
  divergence?: {
    comparedAgainstFilePath: string;
    comparedAgainstNormalizedFilePath: string;
    jaccardSimilarity: number;
    tokenOverlapCount: number;
    comparedTokenCount: number;
  };
};

export type AdmissionNormalizationInput = {
  sourceFilePath: string;
  text: string;
};

export type AdmissionDivergenceInput = {
  leftSourceFilePath: string;
  leftNormalizedFilePath: string;
  leftText: string;
  rightSourceFilePath: string;
  rightNormalizedFilePath: string;
  rightText: string;
};
