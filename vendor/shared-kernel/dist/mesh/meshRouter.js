import { createArtifactId } from "../artifacts/artifactFactory.js";
import { assertRequiredFields } from "../governance/transitionGuards.js";
import { accept, refuse } from "../governance/refusalRules.js";
import { MeshRegistry } from "./meshRegistry.js";
import { DEFAULT_MESH_ROUTES } from "./meshRegistryEntries.js";
const registry = new MeshRegistry(DEFAULT_MESH_ROUTES);
export function routeArtifact(sourceDomain, targetDomain, artifactType, payload) {
    assertRequiredFields("Mesh payload", payload, Object.keys(payload));
    if (!registry.canRoute(sourceDomain, targetDomain, artifactType)) {
        return {
            decision: refuse("illegal_route", `Route not allowed: ${sourceDomain} -> ${targetDomain} for ${artifactType}`)
        };
    }
    const envelope = {
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
//# sourceMappingURL=meshRouter.js.map