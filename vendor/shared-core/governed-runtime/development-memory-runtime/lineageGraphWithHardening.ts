import { inspectMemoryContext } from "./lineageGraph";
import { loadRootHardeningArtifacts } from "./rootHardeningStore";

export function inspectMemoryContextWithHardening(memoryId: string) {
  const context = inspectMemoryContext(memoryId);
  const hardening = loadRootHardeningArtifacts(memoryId);

  return {
    ...context,
    rootHardening: hardening
  };
}
