import type { SharedArtifactType } from "../artifacts/artifactTypes.js";
import type { MeshDomain, MeshRoute } from "./meshContracts.js";

export class MeshRegistry {
  private readonly routes: MeshRoute[];

  public constructor(initialRoutes: MeshRoute[]) {
    this.routes = [...initialRoutes];
  }

  public canRoute(
    sourceDomain: MeshDomain,
    targetDomain: MeshDomain,
    artifactType: SharedArtifactType
  ): boolean {
    return this.routes.some(
      (route) =>
        route.sourceDomain === sourceDomain &&
        route.targetDomain === targetDomain &&
        route.artifactTypes.includes(artifactType)
    );
  }

  public listRoutes(): MeshRoute[] {
    return [...this.routes];
  }
}
