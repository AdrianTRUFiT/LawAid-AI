import { deriveAdmissionDecision } from "./admissionDecision.js";
import { normalizeEnvelope } from "./normalizationEngine.js";
import { evaluateSchemaConformance } from "./schemaConformance.js";
import { classifyTrust } from "./trustClassification.js";
import type {
  RawInputEnvelope,
  VerificationAdmissionsResult,
} from "./verificationAdmissionsTypes.js";
import { validateNormalizedArtifact } from "./validationEngine.js";

export function runVerificationAdmissions(
  rawInput: RawInputEnvelope,
): VerificationAdmissionsResult {
  const schemaConformance = evaluateSchemaConformance(rawInput);

  if (!schemaConformance.conforms) {
    return {
      rawInput,
      schemaConformance,
      normalizedArtifact: null,
      validationReport: null,
      trustClassification: null,
      admissionDecision: deriveAdmissionDecision(schemaConformance, null, null),
    };
  }

  const normalizedArtifact = normalizeEnvelope(rawInput);
  const validationReport = validateNormalizedArtifact(normalizedArtifact);
  const trustClassification = classifyTrust(rawInput.sourceClass, validationReport);
  const admissionDecision = deriveAdmissionDecision(
    schemaConformance,
    validationReport,
    trustClassification,
  );

  return {
    rawInput,
    schemaConformance,
    normalizedArtifact,
    validationReport,
    trustClassification,
    admissionDecision,
  };
}