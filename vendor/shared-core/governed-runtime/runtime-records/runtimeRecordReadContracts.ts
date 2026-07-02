export type RuntimeSealedRecordReadResult = {
  artifactType: "RUNTIME_SEALED_RECORD_READ_RESULT";
  evaluatedAt: string;
  filePath: string;
  sealStatus: "READ_SEAL_VALID" | "READ_SEAL_BROKEN" | "READ_SEAL_INVALID";
  reasonCodes: string[];
  expectedHash?: string;
  computedHash?: string;
  sealedFields: string[];
  recordArtifactType?: string;
};
