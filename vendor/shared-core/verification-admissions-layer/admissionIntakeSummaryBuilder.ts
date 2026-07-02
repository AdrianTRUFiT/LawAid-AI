import type { AdmissionIntakeSummary } from "./admissionIntakeSummaryContracts";

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

export function buildAdmissionIntakeSummary(input: any): AdmissionIntakeSummary {
  return {
    artifactType: "ADMISSION_INTAKE_SUMMARY",
    generatedAt: new Date().toISOString(),
    sourceFilePath: input.sourceFilePath,
    normalizedFilePath: input.normalizedFilePath,
    readabilityState: input.readabilityState,
    normalizationState: input.normalizationState,
    divergenceState: input.divergenceState,
    linkage: {
      sourceFilePath: input.linkage.sourceFilePath,
      normalizedFilePath: input.linkage.normalizedFilePath
    },
    fingerprintSummary: {
      rawHash: input.fingerprints.rawHash,
      normalizedHash: input.fingerprints.normalizedHash,
      tokenSetHash: input.fingerprints.tokenSetHash,
      visibleCharCount: input.fingerprints.visibleCharCount,
      printableRatio: input.fingerprints.printableRatio,
      tokenCount: input.fingerprints.tokenCount
    },
    reasonCodes: sortStrings(input.reasonCodes ?? []),
    comparedAgainst: input.divergence
      ? {
          sourceFilePath: input.divergence.comparedAgainstFilePath,
          normalizedFilePath: input.divergence.comparedAgainstNormalizedFilePath,
          jaccardSimilarity: input.divergence.jaccardSimilarity,
          tokenOverlapCount: input.divergence.tokenOverlapCount,
          comparedTokenCount: input.divergence.comparedTokenCount
        }
      : undefined
  };
}
