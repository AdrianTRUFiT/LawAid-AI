import { areDependenciesSatisfied, expandWithDependencies } from "./dependencyEngine.js";
import { getScenarioDefaultLights, UNIVERSAL_LIGHT_LIBRARY } from "./lightLibrary.js";
import type {
  WorkflowCompositionResult,
  WorkflowLightDefinition,
  WorkflowLightState,
  WorkflowScenarioInput,
} from "./workflowTypes.js";
import { makeId, mergeLocalization } from "./workflowUtils.js";

function buildLightState(input: {
  light: WorkflowLightDefinition;
  required: boolean;
  activeIds: Set<string>;
}): WorkflowLightState {
  const dependenciesSatisfied = areDependenciesSatisfied({
    light: input.light,
    activeIds: input.activeIds,
  });

  let status: WorkflowLightState["status"] = "inactive";
  let reason = "Not required for this workflow string.";

  if (input.required && !dependenciesSatisfied) {
    status = "blocked";
    reason = "Required light is blocked by missing dependency.";
  } else if (input.required && dependenciesSatisfied) {
    status = "active";
    reason = "Required light activated successfully.";
  } else if (!input.required && dependenciesSatisfied) {
    status = "ready";
    reason = "Available but not required for this workflow string.";
  }

  return {
    lightId: input.light.lightId,
    label: input.light.label,
    category: input.light.category,
    dependencyIds: input.light.dependencyIds,
    required: input.required,
    status,
    order: input.light.defaultOrder,
    reason,
  };
}

export function composeWorkflowLightString(
  scenario: WorkflowScenarioInput,
): WorkflowCompositionResult {
  const scenarioDefaults = getScenarioDefaultLights(scenario.scenarioType);
  const requested = scenario.requestedLightIds && scenario.requestedLightIds.length > 0
    ? scenario.requestedLightIds
    : scenarioDefaults;

  const expandedIds = expandWithDependencies({
    requestedIds: requested,
    library: UNIVERSAL_LIGHT_LIBRARY,
  });

  const requiredIds = new Set(expandedIds);
  const activeIds = new Set<string>();
  const pending = [...UNIVERSAL_LIGHT_LIBRARY].sort((a, b) => a.defaultOrder - b.defaultOrder);

  for (const light of pending) {
    if (!requiredIds.has(light.lightId)) {
      continue;
    }

    if (areDependenciesSatisfied({ light, activeIds })) {
      activeIds.add(light.lightId);
    }
  }

  const lights = pending.map((light) =>
    buildLightState({
      light,
      required: requiredIds.has(light.lightId),
      activeIds,
    }),
  );

  const requiredLightCount = lights.filter((x) => x.required).length;
  const activeLightCount = lights.filter((x) => x.status === "active").length;
  const blockedLightCount = lights.filter((x) => x.status === "blocked").length;

  return {
    workflow: {
      workflowStringId: makeId("workflow"),
      scenarioId: scenario.scenarioId,
      scenarioType: scenario.scenarioType,
      localization: mergeLocalization(scenario.localization),
      lights,
      requiredLightCount,
      activeLightCount,
      blockedLightCount,
      fullyIlluminated: requiredLightCount > 0 && blockedLightCount === 0 && activeLightCount === requiredLightCount,
      generatedAt: new Date().toISOString(),
    },
  };
}