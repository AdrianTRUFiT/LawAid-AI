import type { SharedArtifactType } from "./artifactTypes.js";

export interface ArtifactIdentity {
  artifactId: string;
  artifactType: SharedArtifactType;
  createdAt: string;
  sourceDomain: string;
  lineageId: string;
}

export function createArtifactId(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);

  return `${prefix}-${timestamp}-${randomPart}`;
}

export function createArtifactIdentity(
  artifactType: SharedArtifactType,
  sourceDomain: string
): ArtifactIdentity {
  const artifactId = createArtifactId(artifactType);
  return {
    artifactId,
    artifactType,
    createdAt: new Date().toISOString(),
    sourceDomain,
    lineageId: createArtifactId("lineage")
  };
}
