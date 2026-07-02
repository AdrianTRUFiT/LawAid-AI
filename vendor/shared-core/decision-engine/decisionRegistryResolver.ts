import { DecisionProjectState } from "./decisionContracts";

export function resolveProjectFromRegistry(
  question: string,
  registry: Record<string, DecisionProjectState>
): DecisionProjectState | undefined {
  const q = question.toLowerCase();

  return Object.entries(registry)
    .map(([name, value]) => ({ name, ...value }))
    .find((project) => q.includes(project.name.toLowerCase()));
}
