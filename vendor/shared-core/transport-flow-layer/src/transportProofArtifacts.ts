import type { ProofArtifact, ProofArtifactType } from "./transportTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createProofArtifact(input: {
  artifactType: ProofArtifactType;
  flowUnitId: string;
  nodeId: string;
  payload: Record<string, unknown>;
}): ProofArtifact {
  return {
    artifactId: makeId("artifact"),
    artifactType: input.artifactType,
    flowUnitId: input.flowUnitId,
    nodeId: input.nodeId,
    createdAt: new Date().toISOString(),
    payload: input.payload,
  };
}