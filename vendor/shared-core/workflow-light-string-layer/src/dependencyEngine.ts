import type { WorkflowLightDefinition } from "./workflowTypes.js";

export function expandWithDependencies(input: {
  requestedIds: string[];
  library: WorkflowLightDefinition[];
}): string[] {
  const byId = new Map(input.library.map((x) => [x.lightId, x]));
  const result = new Set<string>();

  function addRec(lightId: string): void {
    if (result.has(lightId)) return;
    const def = byId.get(lightId);
    if (!def) return;

    for (const dep of def.dependencyIds) {
      addRec(dep);
    }

    result.add(lightId);
  }

  for (const lightId of input.requestedIds) {
    addRec(lightId);
  }

  return Array.from(result);
}

export function areDependenciesSatisfied(input: {
  light: WorkflowLightDefinition;
  activeIds: Set<string>;
}): boolean {
  return input.light.dependencyIds.every((dep) => input.activeIds.has(dep));
}