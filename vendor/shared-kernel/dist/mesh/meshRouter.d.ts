import type { SharedArtifactType } from "../artifacts/artifactTypes.js";
import { type GovernanceDecision } from "../governance/refusalRules.js";
import type { MeshDomain, MeshEnvelope } from "./meshContracts.js";
export declare function routeArtifact<TPayload extends Record<string, unknown>>(sourceDomain: MeshDomain, targetDomain: MeshDomain, artifactType: SharedArtifactType, payload: TPayload): {
    decision: GovernanceDecision;
    envelope?: MeshEnvelope<TPayload>;
};
