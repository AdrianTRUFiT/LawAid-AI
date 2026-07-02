import crypto from 'crypto';
import { ARTIFACT_ORDER, SimulationArtifact, SimulationArtifactType, SimulationNode } from './simulationContracts';

function id(prefix: string, payload: any) {
  return prefix + "-" + crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 12);
}

export function createSimulationArtifact(input: {
  type: SimulationArtifactType;
  node: SimulationNode;
  parentArtifact?: SimulationArtifact;
}) {
  if (input.parentArtifact) {
    const parentIndex = ARTIFACT_ORDER.indexOf(input.parentArtifact.type);
    const currentIndex = ARTIFACT_ORDER.indexOf(input.type);

    if (currentIndex !== parentIndex + 1) {
      return {
        artifactId: id("REFUSED", input),
        type: input.type,
        node: input.node,
        parentArtifactId: input.parentArtifact.artifactId,
        status: "REFUSED",
        reason: "INVALID_ARTIFACT_TRANSITION",
        createdAt: Date.now()
      };
    }

    if (input.parentArtifact.status !== "ACTIVE") {
      return {
        artifactId: id("REFUSED", input),
        type: input.type,
        node: input.node,
        parentArtifactId: input.parentArtifact.artifactId,
        status: "REFUSED",
        reason: "PARENT_ARTIFACT_NOT_ACTIVE",
        createdAt: Date.now()
      };
    }
  }

  const artifact = {
    artifactId: id("SIM", input),
    type: input.type,
    node: input.node,
    parentArtifactId: input.parentArtifact?.artifactId,
    status: "ACTIVE",
    createdAt: Date.now()
  };

  return artifact;
}
