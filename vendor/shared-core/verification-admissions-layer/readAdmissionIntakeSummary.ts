import type { AdmissionIntakeSummary } from "./admissionIntakeSummaryContracts";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function classifyAdmissionIntakeSummaryShape(value: unknown):
  | "ADMISSION_INTAKE_SUMMARY_VALID"
  | "ADMISSION_INTAKE_SUMMARY_INVALID" {
  if (!value || typeof value !== "object") {
    return "ADMISSION_INTAKE_SUMMARY_INVALID";
  }

  const data = value as Record<string, unknown>;

  if (data.artifactType !== "ADMISSION_INTAKE_SUMMARY") {
    return "ADMISSION_INTAKE_SUMMARY_INVALID";
  }

  if (!isString(data.generatedAt)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(data.sourceFilePath)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(data.normalizedFilePath)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(data.readabilityState)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(data.normalizationState)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(data.divergenceState)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isStringArray(data.reasonCodes)) return "ADMISSION_INTAKE_SUMMARY_INVALID";

  const linkage = data.linkage as Record<string, unknown> | undefined;
  if (!linkage || typeof linkage !== "object") return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(linkage.sourceFilePath)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(linkage.normalizedFilePath)) return "ADMISSION_INTAKE_SUMMARY_INVALID";

  const fp = data.fingerprintSummary as Record<string, unknown> | undefined;
  if (!fp || typeof fp !== "object") return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(fp.rawHash)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(fp.normalizedHash)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isString(fp.tokenSetHash)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isFiniteNumber(fp.visibleCharCount)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isFiniteNumber(fp.printableRatio)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  if (!isFiniteNumber(fp.tokenCount)) return "ADMISSION_INTAKE_SUMMARY_INVALID";

  if (data.comparedAgainst !== undefined) {
    const compared = data.comparedAgainst as Record<string, unknown>;
    if (!compared || typeof compared !== "object") return "ADMISSION_INTAKE_SUMMARY_INVALID";
    if (!isString(compared.sourceFilePath)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
    if (!isString(compared.normalizedFilePath)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
    if (!isFiniteNumber(compared.jaccardSimilarity)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
    if (!isFiniteNumber(compared.tokenOverlapCount)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
    if (!isFiniteNumber(compared.comparedTokenCount)) return "ADMISSION_INTAKE_SUMMARY_INVALID";
  }

  return "ADMISSION_INTAKE_SUMMARY_VALID";
}

export function assertAdmissionIntakeSummary(value: unknown): AdmissionIntakeSummary {
  const classification = classifyAdmissionIntakeSummaryShape(value);
  if (classification !== "ADMISSION_INTAKE_SUMMARY_VALID") {
    throw new Error("admission_intake_summary_invalid");
  }
  return value as AdmissionIntakeSummary;
}
