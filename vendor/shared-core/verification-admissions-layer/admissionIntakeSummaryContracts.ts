export type AdmissionIntakeSummary = {
  artifactType: "ADMISSION_INTAKE_SUMMARY";
  generatedAt: string;
  sourceFilePath: string;
  normalizedFilePath: string;
  readabilityState: string;
  normalizationState: string;
  divergenceState: string;
  linkage: {
    sourceFilePath: string;
    normalizedFilePath: string;
  };
  fingerprintSummary: {
    rawHash: string;
    normalizedHash: string;
    tokenSetHash: string;
    visibleCharCount: number;
    printableRatio: number;
    tokenCount: number;
  };
  reasonCodes: string[];
  comparedAgainst?: {
    sourceFilePath: string;
    normalizedFilePath: string;
    jaccardSimilarity: number;
    tokenOverlapCount: number;
    comparedTokenCount: number;
  };
};
