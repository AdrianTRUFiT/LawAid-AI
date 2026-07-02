import { createArtifactId } from "../artifacts/artifactFactory.js";
import type { SharedArtifactType } from "../artifacts/artifactTypes.js";
import { assertRequiredFields } from "../governance/transitionGuards.js";
import { accept, refuse, type GovernanceDecision } from "../governance/refusalRules.js";
import { MeshRegistry } from "./meshRegistry.js";
import { DEFAULT_MESH_ROUTES } from "./meshRegistryEntries.js";
import type { MeshDomain, MeshEnvelope } from "./meshContracts.js";

const registry = new MeshRegistry(DEFAULT_MESH_ROUTES);

export function routeArtifact<TPayload extends Record<string, unknown>>(
  sourceDomain: MeshDomain,
  targetDomain: MeshDomain,
  artifactType: SharedArtifactType,
  payload: TPayload
): { decision: GovernanceDecision; envelope?: MeshEnvelope<TPayload> } {
  assertRequiredFields("Mesh payload", payload, Object.keys(payload));

  if (!registry.canRoute(sourceDomain, targetDomain, artifactType)) {
    return {
      decision: refuse(
        "illegal_route",
        `Route not allowed: ${sourceDomain} -> ${targetDomain} for ${artifactType}`
      )
    };
  }

  const envelope: MeshEnvelope<TPayload> = {
    envelopeId: createArtifactId("mesh-envelope"),
    sourceDomain,
    targetDomain,
    artifactType,
    payload,
    status: "pending",
    authorityMarker: "working",
    createdAt: new Date().toISOString()
  };

  return {
    decision: accept(),
    envelope
  };
}
