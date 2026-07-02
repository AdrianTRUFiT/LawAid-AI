import crypto from 'crypto';

export type LineageArtifact = {
  artifactId: string;
  type: string;
  parentArtifactId?: string;
  lineageHash?: string;
  status: "ACTIVE" | "INVALID" | "SUPERSEDED";
};

function sha256(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function createLineageHash(input: LineageArtifact) {
  return sha256(JSON.stringify({
    artifactId: input.artifactId,
    type: input.type,
    parentArtifactId: input.parentArtifactId || null,
    status: input.status
  }));
}

export function verifyLineageChain(chain: LineageArtifact[]) {
  if (chain.length === 0) {
    return {
      decision: "REFUSE",
      reason: "EMPTY_LINEAGE_CHAIN"
    };
  }

  for (const artifact of chain) {
    if (artifact.status !== "ACTIVE") {
      return {
        decision: "REFUSE",
        reason: "LINEAGE_ARTIFACT_NOT_ACTIVE",
        artifactId: artifact.artifactId
      };
    }

    const expected = createLineageHash(artifact);

    if (artifact.lineageHash && artifact.lineageHash !== expected) {
      return {
        decision: "REFUSE",
        reason: "LINEAGE_HASH_MISMATCH",
        artifactId: artifact.artifactId
      };
    }
  }

  for (let i = 1; i < chain.length; i++) {
    if (chain[i].parentArtifactId !== chain[i - 1].artifactId) {
      return {
        decision: "REFUSE",
        reason: "PARENT_CHILD_LINEAGE_BREAK",
        artifactId: chain[i].artifactId,
        expectedParent: chain[i - 1].artifactId,
        actualParent: chain[i].parentArtifactId
      };
    }
  }

  return {
    decision: "ALLOW",
    reason: "LINEAGE_CHAIN_VERIFIED",
    artifacts: chain.map(a => a.artifactId)
  };
}
