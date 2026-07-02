import type { NormalizedArtifact, ValidationReport } from "./verificationAdmissionsTypes.js";

export function validateNormalizedArtifact(
  artifact: NormalizedArtifact,
): ValidationReport {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!artifact.normalizedPayload.subjectId || artifact.normalizedPayload.subjectId === "unknown_subject") {
    issues.push("subjectId is missing or unknown.");
  }

  if (!artifact.normalizedPayload.stateLabel || artifact.normalizedPayload.stateLabel === "unknown_state") {
    issues.push("stateLabel is missing or unknown.");
  }

  if (artifact.normalizedPayload.ageBars < 0) {
    issues.push("ageBars cannot be negative.");
  }

  if (artifact.normalizedPayload.direction === "unknown") {
    warnings.push("direction is unknown.");
  }

  if (artifact.normalizedPayload.magnitude < 0) {
    warnings.push("magnitude is negative; check source meaning.");
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}