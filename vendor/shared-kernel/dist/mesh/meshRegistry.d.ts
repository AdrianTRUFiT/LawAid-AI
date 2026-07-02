import type { SharedArtifactType } from "../artifacts/artifactTypes.js";
import type { MeshDomain, MeshRoute } from "./meshContracts.js";
export declare class MeshRegistry {
    private readonly routes;
    constructor(initialRoutes: MeshRoute[]);
    canRoute(sourceDomain: MeshDomain, targetDomain: MeshDomain, artifactType: SharedArtifactType): boolean;
    listRoutes(): MeshRoute[];
}
