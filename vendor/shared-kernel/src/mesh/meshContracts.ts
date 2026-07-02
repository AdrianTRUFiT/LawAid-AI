import type { SharedArtifactType } from "../artifacts/artifactTypes.js";
import type { ArtifactStatus } from "../artifacts/artifactStatus.js";
import type { AuthorityMarker } from "../governance/authorityContracts.js";

export type MeshDomain =
  | "shared-kernel"
  | "ai-coding-lab"
  | "dice"
  | "aiop"
  | "fundtracker"
  | "lawaidai";

export interface MeshEnvelope<TPayload> {
  envelopeId: string;
  sourceDomain: MeshDomain;
  targetDomain: MeshDomain;
  artifactType: SharedArtifactType;
  payload: TPayload;
  status: ArtifactStatus;
  authorityMarker: AuthorityMarker;
  createdAt: string;
}

export interface MeshRoute {
  sourceDomain: MeshDomain;
  targetDomain: MeshDomain;
  artifactTypes: SharedArtifactType[];
}
