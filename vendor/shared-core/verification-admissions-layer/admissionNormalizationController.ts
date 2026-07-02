import * as fs from "node:fs";
import * as path from "node:path";
import type {
  AdmissionNormalizationArtifact,
  AdmissionNormalizationInput
} from "./admissionReadabilityContracts";
import { normalizeAdmissionText } from "./admissionNormalizationEngine";
import { classifyAdmissionReadability } from "./admissionReadabilityClassifier";
import { buildAdmissionFingerprint } from "./admissionFingerprint";
import { detectAdmissionDivergence } from "./admissionDivergenceDetector";

function outDir(): string {
  const dir = path.resolve(
    process.cwd(),
    "shared-core",
    "governed-runtime",
    "store",
    "admissions-readability"
  );
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function normalizedOutPath(sourceFilePath: string): string {
  const base = path.basename(sourceFilePath).replace(/\.[^.]+$/, "");
  return path.join(outDir(), `${base}.normalized.md`);
}

function artifactOutPath(sourceFilePath: string): string {
  const base = path.basename(sourceFilePath).replace(/\.[^.]+$/, "");
  return path.join(outDir(), `${base}.admission-normalization.json`);
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

export function processAdmissionNormalization(input: AdmissionNormalizationInput): AdmissionNormalizationArtifact {
  const normalizedText = normalizeAdmissionText(input.text);
  const readability = classifyAdmissionReadability(input.text, normalizedText);
  const fingerprints = buildAdmissionFingerprint(input.text, normalizedText);

  const reasonCodes = [...readability.reasonCodes];
  const normalizationState =
    input.text === normalizedText ? "ADMISSION_NOT_NORMALIZED" : "ADMISSION_NORMALIZED";

  reasonCodes.push(
    normalizationState === "ADMISSION_NORMALIZED"
      ? "NORMALIZATION_CHANGED_TEXT"
      : "NORMALIZATION_NO_CHANGE"
  );

  return {
    artifactType: "ADMISSION_NORMALIZATION_ARTIFACT",
    generatedAt: new Date().toISOString(),
    sourceFilePath: input.sourceFilePath,
    normalizedFilePath: normalizedOutPath(input.sourceFilePath),
    linkage: {
      sourceFilePath: input.sourceFilePath,
      normalizedFilePath: normalizedOutPath(input.sourceFilePath)
    },
    readabilityState: readability.readabilityState,
    normalizationState,
    divergenceState: "ADMISSION_NO_DIVERGENCE",
    reasonCodes,
    originalTextLength: input.text.length,
    normalizedTextLength: normalizedText.length,
    fingerprints
  };
}

export function writeAdmissionNormalizationArtifact(sourceFilePath: string): AdmissionNormalizationArtifact {
  const text = readText(sourceFilePath);
  const artifact = processAdmissionNormalization({
    sourceFilePath,
    text
  });

  const normalizedText = normalizeAdmissionText(text);
  fs.writeFileSync(artifact.normalizedFilePath, normalizedText, "utf8");
  fs.writeFileSync(artifactOutPath(sourceFilePath), JSON.stringify(artifact, null, 2), "utf8");
  return artifact;
}

export function writeAdmissionDivergenceArtifact(leftSourceFilePath: string, rightSourceFilePath: string) {
  const leftText = normalizeAdmissionText(readText(leftSourceFilePath));
  const rightText = normalizeAdmissionText(readText(rightSourceFilePath));

  const leftArtifactPath = artifactOutPath(leftSourceFilePath);
  const rightArtifactPath = artifactOutPath(rightSourceFilePath);

  if (!fs.existsSync(leftArtifactPath)) {
    writeAdmissionNormalizationArtifact(leftSourceFilePath);
  }
  if (!fs.existsSync(rightArtifactPath)) {
    writeAdmissionNormalizationArtifact(rightSourceFilePath);
  }

  const leftArtifact = JSON.parse(fs.readFileSync(leftArtifactPath, "utf8").replace(/^\uFEFF/, ""));
  const divergence = detectAdmissionDivergence({
    leftSourceFilePath,
    leftNormalizedFilePath: leftArtifact.normalizedFilePath,
    leftText,
    rightSourceFilePath,
    rightNormalizedFilePath: normalizedOutPath(rightSourceFilePath),
    rightText
  });

  leftArtifact.divergenceState = divergence.divergenceState;
  leftArtifact.reasonCodes = Array.from(new Set([...leftArtifact.reasonCodes, ...divergence.reasonCodes])).sort((a, b) => a.localeCompare(b));
  leftArtifact.divergence = divergence.divergence;

  fs.writeFileSync(leftArtifactPath, JSON.stringify(leftArtifact, null, 2), "utf8");
  return leftArtifact;
}
