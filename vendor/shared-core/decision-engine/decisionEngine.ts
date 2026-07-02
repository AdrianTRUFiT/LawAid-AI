import { ExecutiveDecisionQuestion, DecisionPacket, DecisionProjectState } from "./decisionContracts";
import { resolveProjectFromRegistry } from "./decisionRegistryResolver";
import { createDecisionPacket } from "./decisionPacket";

function missingFields(project: DecisionProjectState): string[] {
  const missing: string[] = [];

  if (!project.product_status) missing.push("product_status missing");
  if (typeof project.completion_percent !== "number") missing.push("completion_percent missing");
  if (!project.launch_readiness) missing.push("launch_readiness missing");
  if (!Array.isArray(project.blockers)) missing.push("blockers missing");
  if (!Array.isArray(project.dependencies)) missing.push("dependencies missing");
  if (!project.nextAction) missing.push("nextAction missing");

  return missing;
}

export function runDecisionEngine(
  request: ExecutiveDecisionQuestion,
  registry: Record<string, DecisionProjectState>
): DecisionPacket {
  const project = resolveProjectFromRegistry(request.question, registry);

  if (!project) {
    return createDecisionPacket({
      request,
      missingIntelligence: ["No matching project found in PROJECT_REGISTRY"]
    });
  }

  return createDecisionPacket({
    request,
    project,
    missingIntelligence: missingFields(project)
  });
}
