import type {
  AdmissionDecision,
  SchemaConformanceResult,
  TrustClassification,
  ValidationReport,
} from "./verificationAdmissionsTypes.js";

export function deriveAdmissionDecision(
  conformance: SchemaConformanceResult,
  validation: ValidationReport | null,
  trust: TrustClassification | null,
): AdmissionDecision {
  if (!conformance.conforms) {
    return {
      status: "REFUSED",
      admitted: false,
      route: "refused",
      reason: "Schema conformance failed.",
    };
  }

  if (!validation || !validation.valid) {
    return {
      status: "QUARANTINED",
      admitted: false,
      route: "quarantine",
      reason: "Validation failed or item requires quarantine.",
    };
  }

  if (!trust) {
    return {
      status: "REFUSED",
      admitted: false,
      route: "refused",
      reason: "Trust classification missing.",
    };
  }

  if (trust.trustClass === "quarantined") {
    return {
      status: "QUARANTINED",
      admitted: false,
      route: "quarantine",
      reason: "Trust classification quarantined the item.",
    };
  }

  return {
    status: "ADMITTED",
    admitted: true,
    route: "mesh",
    reason: "Input admitted through governed conformance, validation, and trust classification.",
  };
}