export class MeshRegistry {
    routes;
    constructor(initialRoutes) {
        this.routes = [...initialRoutes];
    }
    canRoute(sourceDomain, targetDomain, artifactType) {
        return this.routes.some((route) => route.sourceDomain === sourceDomain &&
            route.targetDomain === targetDomain &&
            route.artifactTypes.includes(artifactType));
    }
    listRoutes() {
        return [...this.routes];
    }
}
//# sourceMappingURL=meshRegistry.js.map