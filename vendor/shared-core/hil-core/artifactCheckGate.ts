import { getArtifact } from '../artifact-registry/artifactRegistry';

export function verifyArtifactActive(artifactId: string) {
  const record = getArtifact(artifactId);

  if (!record) {
    return {
      decision: "REFUSE",
      reason: "ARTIFACT_NOT_FOUND"
    };
  }

  if (record.status !== "ACTIVE") {
    return {
      decision: "REFUSE",
      reason: "ARTIFACT_NOT_ACTIVE"
    };
  }

  return {
    decision: "ALLOW"
  };
}
