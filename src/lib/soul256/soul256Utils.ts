import crypto from "node:crypto";
import type { Soul256Artifact } from "./soul256Contracts";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function hashPayload(input: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function buildArtifact(
  type: Soul256Artifact["type"],
  payload: unknown,
  checkpointId?: string
): Soul256Artifact {
  return {
    artifactId: makeId("art"),
    type,
    checkpointId,
    recordedAt: nowIso(),
    payloadHash: hashPayload(payload),
  };
}
