import type { SharedArtifactType } from "./artifactTypes.js";
export interface ArtifactIdentity {
    artifactId: string;
    artifactType: SharedArtifactType;
    createdAt: string;
    sourceDomain: string;
    lineageId: string;
}
export declare function createArtifactId(prefix: string): string;
export declare function createArtifactIdentity(artifactType: SharedArtifactType, sourceDomain: string): ArtifactIdentity;
