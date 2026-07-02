import type {
  AdmissionDivergenceInput,
  AdmissionDivergenceState
} from "./admissionReadabilityContracts";
import { buildTokenSet } from "./admissionFingerprint";

export function detectAdmissionDivergence(input: AdmissionDivergenceInput): {
  divergenceState: AdmissionDivergenceState;
  reasonCodes: ("NEAR_DUPLICATE_DIVERGENCE" | "NO_NEAR_DUPLICATE_DIVERGENCE")[];
  divergence?: {
    comparedAgainstFilePath: string;
    comparedAgainstNormalizedFilePath: string;
    jaccardSimilarity: number;
    tokenOverlapCount: number;
    comparedTokenCount: number;
  };
} {
  const left = buildTokenSet(input.leftText);
  const right = buildTokenSet(input.rightText);

  const union = new Set([...left, ...right]);
  let overlapCount = 0;
  for (const token of left) {
    if (right.has(token)) overlapCount += 1;
  }

  const jaccard = union.size === 0 ? 0 : overlapCount / union.size;
  const leftRightDifferent = input.leftText !== input.rightText;
  const nearDuplicate = jaccard >= 0.82;

  if (nearDuplicate && leftRightDifferent) {
    return {
      divergenceState: "ADMISSION_DIVERGENCE_DETECTED",
      reasonCodes: ["NEAR_DUPLICATE_DIVERGENCE"],
      divergence: {
        comparedAgainstFilePath: input.rightSourceFilePath,
        comparedAgainstNormalizedFilePath: input.rightNormalizedFilePath,
        jaccardSimilarity: Number(jaccard.toFixed(6)),
        tokenOverlapCount: overlapCount,
        comparedTokenCount: union.size
      }
    };
  }

  return {
    divergenceState: "ADMISSION_NO_DIVERGENCE",
    reasonCodes: ["NO_NEAR_DUPLICATE_DIVERGENCE"]
  };
}
