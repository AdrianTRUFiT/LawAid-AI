export function createArtifactId(prefix) {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
        : Math.random().toString(36).slice(2, 14);
    return `${prefix}-${timestamp}-${randomPart}`;
}
export function createArtifactIdentity(artifactType, sourceDomain) {
    const artifactId = createArtifactId(artifactType);
    return {
        artifactId,
        artifactType,
        createdAt: new Date().toISOString(),
        sourceDomain,
        lineageId: createArtifactId("lineage")
    };
}
//# sourceMappingURL=artifactFactory.js.map