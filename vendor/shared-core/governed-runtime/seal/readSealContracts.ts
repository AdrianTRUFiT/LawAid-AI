export type ReadSealStatus =
  | "READ_SEAL_VALID"
  | "READ_SEAL_BROKEN"
  | "READ_SEAL_INVALID";

export type ReadSealReasonCode =
  | "SEAL_HASH_MATCH"
  | "SEAL_HASH_MISMATCH"
  | "SEAL_MISSING"
  | "SEALED_PAYLOAD_MISSING"
  | "SEALED_FIELDS_PARTIAL"
  | "CANONICALIZATION_FAILED";

export type SealedRecordEnvelope = {
  artifactType: string;
  sealedAt: string;
  seal: {
    algorithm: "sha256";
    canonicalHash: string;
    sealedFields: string[];
  };
  payload: Record<string, unknown>;
};

export type ReadSealDecision = {
  artifactType: "READ_SEAL_DECISION";
  evaluatedAt: string;
  status: ReadSealStatus;
  reasonCodes: ReadSealReasonCode[];
  expectedHash?: string;
  computedHash?: string;
  sealedFields: string[];
};
