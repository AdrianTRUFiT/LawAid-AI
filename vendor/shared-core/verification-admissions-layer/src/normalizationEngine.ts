import type { NormalizedArtifact, RawInputEnvelope } from "./verificationAdmissionsTypes.js";
import { asNumber, asString, nowIso } from "./verificationAdmissionsUtils.js";

function normalizeDirection(value: unknown): "up" | "down" | "neutral" | "unknown" {
  const normalized = asString(value, "").trim().toLowerCase();

  if (normalized === "up") return "up";
  if (normalized === "down") return "down";
  if (normalized === "neutral") return "neutral";
  return "unknown";
}

export function normalizeEnvelope(
  envelope: RawInputEnvelope,
): NormalizedArtifact {
  return {
    envelopeId: envelope.envelopeId,
    sourceId: envelope.sourceId,
    sourceClass: envelope.sourceClass,
    dataShapeClass: envelope.dataShapeClass,
    normalizedPayload: {
      subjectId: asString(envelope.payload.subjectId, "unknown_subject"),
      direction: normalizeDirection(envelope.payload.direction),
      stateLabel: asString(envelope.payload.stateLabel, "unknown_state"),
      magnitude: asNumber(envelope.payload.magnitude, 0),
      ageBars: asNumber(envelope.payload.ageBars, 0),
      timestamp: asString(envelope.payload.timestamp, nowIso()),
      attributes: {
        ...envelope.payload,
      },
    },
  };
}