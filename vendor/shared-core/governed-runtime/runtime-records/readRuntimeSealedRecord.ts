import * as fs from "node:fs";
import { revalidateReadSeal } from "../seal/readSealRevalidator";
import type { RuntimeSealedRecordReadResult } from "./runtimeRecordReadContracts";

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

export function readRuntimeSealedRecord(filePath: string): RuntimeSealedRecordReadResult {
  const raw = readJson(filePath);
  const decision = revalidateReadSeal(raw);

  return {
    artifactType: "RUNTIME_SEALED_RECORD_READ_RESULT",
    evaluatedAt: new Date().toISOString(),
    filePath,
    sealStatus: decision.status,
    reasonCodes: decision.reasonCodes,
    expectedHash: decision.expectedHash,
    computedHash: decision.computedHash,
    sealedFields: decision.sealedFields,
    recordArtifactType: typeof raw?.artifactType === "string" ? raw.artifactType : undefined
  };
}
