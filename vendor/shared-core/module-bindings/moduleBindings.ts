import { attemptExecution } from '../hil-core/executionSwitchyard';
import { createProjectBox } from '../utility-container/projectBoxFactory';

function buildContext(artifactId: string) {
  const now = Date.now();
  return {
    artifactId,
    lastVerifiedAt: now - 1000,
    currentTime: now,
    dependenciesValid: true,
    sequenceValid: true
  };
}

function hardPermission(target: string) {
  return {
    actor: "HARD",
    action: "route_execution",
    target
  };
}

export function bindFundTrackerAI() {
  const box = createProjectBox({
    domain: "FINANCIAL",
    category: "fundtracker_activation_consequence",
    tags: ["custody", "routing", "schedule", "transaction"],
    custodyRequired: true,
    routingRequired: true,
    schedulingRequired: true,
    transactionRequired: true
  });

  return attemptExecution({
    eventId: "FUNDTRACKER_BINDING_TEST",
    projectBox: box,
    permission: hardPermission("fundtracker_activation"),
    context: buildContext(box.artifactId)
  });
}

export function bindLawAidAI() {
  const box = createProjectBox({
    domain: "LEGAL",
    category: "lawaidai_receiving_consequence",
    tags: ["custody", "routing", "schedule", "transaction"],
    custodyRequired: true,
    routingRequired: true,
    schedulingRequired: true,
    transactionRequired: true
  });

  return attemptExecution({
    eventId: "LAWAIDAI_BINDING_TEST",
    projectBox: box,
    permission: hardPermission("lawaidai_receiving"),
    context: buildContext(box.artifactId)
  });
}

export function bindLAIW() {
  const box = createProjectBox({
    domain: "SMART_CITY",
    category: "laiw_verified_route_consequence",
    tags: [
      "custody",
      "routing",
      "schedule",
      "transaction",
      "provenance",
      "agent_policy",
      "human_override"
    ],
    custodyRequired: true,
    routingRequired: true,
    schedulingRequired: true,
    transactionRequired: true
  });

  return attemptExecution({
    eventId: "LAIW_BINDING_TEST",
    projectBox: box,
    permission: hardPermission("laiw_route_execution"),
    context: buildContext(box.artifactId)
  });
}
