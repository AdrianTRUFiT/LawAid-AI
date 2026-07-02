import { createHash } from "node:crypto";
import type { ReadSealDecision, ReadSealReasonCode, SealedRecordEnvelope } from "./readSealContracts";
import { classifyReadSealEnvelope } from "./readSealClassifier";

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(obj[key])}`).join(",")}}`;
}

function buildCanonicalPayload(envelope: SealedRecordEnvelope): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const sealedFields = [...envelope.seal.sealedFields].sort((a, b) => a.localeCompare(b));

  for (const field of sealedFields) {
    out[field] = envelope.payload[field];
  }

  return out;
}

function hashCanonicalPayload(envelope: SealedRecordEnvelope): string {
  const canonicalPayload = buildCanonicalPayload(envelope);
  const canonicalString = stableSerialize(canonicalPayload);
  return createHash("sha256").update(canonicalString, "utf8").digest("hex");
}

export function revalidateReadSeal(value: unknown): ReadSealDecision {
  const classified = classifyReadSealEnvelope(value);

  if (!classified.envelope) {
    return {
      artifactType: "READ_SEAL_DECISION",
      evaluatedAt: new Date().toISOString(),
      status: classified.status,
      reasonCodes: classified.reasonCodes,
      sealedFields: []
    };
  }

  const envelope = classified.envelope;
  const computedHash = hashCanonicalPayload(envelope);
  const expectedHash = envelope.seal.canonicalHash;
  const sealedFields = [...envelope.seal.sealedFields].sort((a, b) => a.localeCompare(b));

  const reasonCodes: ReadSealReasonCode[] = [];
  if (computedHash === expectedHash) {
    reasonCodes.push("SEAL_HASH_MATCH");
    return {
      artifactType: "READ_SEAL_DECISION",
      evaluatedAt: new Date().toISOString(),
      status: "READ_SEAL_VALID",
      reasonCodes,
      expectedHash,
      computedHash,
      sealedFields
    };
  }

  reasonCodes.push("SEAL_HASH_MISMATCH");
  return {
    artifactType: "READ_SEAL_DECISION",
    evaluatedAt: new Date().toISOString(),
    status: "READ_SEAL_BROKEN",
    reasonCodes,
    expectedHash,
    computedHash,
    sealedFields
  };
}
