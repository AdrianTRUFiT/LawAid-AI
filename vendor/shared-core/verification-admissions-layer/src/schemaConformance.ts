import type { RawInputEnvelope, SchemaConformanceResult } from "./verificationAdmissionsTypes.js";

const REQUIRED_KEYS: Record<string, string[]> = {
  movement: ["subjectId", "stateLabel", "timestamp"],
  position: ["subjectId", "stateLabel", "timestamp"],
  event: ["subjectId", "stateLabel", "timestamp"],
  signal: ["subjectId", "stateLabel", "timestamp"],
  generic: ["subjectId", "stateLabel", "timestamp"],
};

export function evaluateSchemaConformance(
  envelope: RawInputEnvelope,
): SchemaConformanceResult {
  const payloadKeys = Object.keys(envelope.payload);
  const requiredKeys = REQUIRED_KEYS[envelope.dataShapeClass] ?? REQUIRED_KEYS.generic;
  const missingKeys = requiredKeys.filter((key) => !payloadKeys.includes(key));
  const unexpectedKeys = payloadKeys.filter((key) => !requiredKeys.includes(key));

  return {
    conforms: missingKeys.length === 0,
    requiredKeys,
    missingKeys,
    unexpectedKeys,
  };
}