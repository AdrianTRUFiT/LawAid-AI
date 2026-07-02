import type { ReadSealReasonCode, ReadSealStatus, SealedRecordEnvelope } from "./readSealContracts";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

export function classifyReadSealEnvelope(value: unknown): {
  status: ReadSealStatus;
  reasonCodes: ReadSealReasonCode[];
  envelope?: SealedRecordEnvelope;
} {
  if (!value || typeof value !== "object") {
    return { status: "READ_SEAL_INVALID", reasonCodes: ["SEAL_MISSING"] };
  }

  const obj = value as Record<string, unknown>;
  const seal = obj.seal as Record<string, unknown> | undefined;
  const payload = obj.payload as Record<string, unknown> | undefined;

  if (!seal || typeof seal !== "object") {
    return { status: "READ_SEAL_INVALID", reasonCodes: ["SEAL_MISSING"] };
  }

  if (!payload || typeof payload !== "object") {
    return { status: "READ_SEAL_INVALID", reasonCodes: ["SEALED_PAYLOAD_MISSING"] };
  }

  if (!isString(obj.artifactType) || !isString(obj.sealedAt)) {
    return { status: "READ_SEAL_INVALID", reasonCodes: ["CANONICALIZATION_FAILED"] };
  }

  if (
    !isString(seal.algorithm) ||
    seal.algorithm !== "sha256" ||
    !isString(seal.canonicalHash) ||
    !isStringArray(seal.sealedFields)
  ) {
    return { status: "READ_SEAL_INVALID", reasonCodes: ["SEAL_MISSING"] };
  }

  const missingFields = (seal.sealedFields as string[]).filter((field) => !(field in payload));
  if (missingFields.length > 0) {
    return { status: "READ_SEAL_INVALID", reasonCodes: ["SEALED_FIELDS_PARTIAL"] };
  }

  return {
    status: "READ_SEAL_VALID",
    reasonCodes: [],
    envelope: value as SealedRecordEnvelope
  };
}
