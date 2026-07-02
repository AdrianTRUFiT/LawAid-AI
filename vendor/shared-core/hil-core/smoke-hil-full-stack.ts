import { attemptExecution } from './executionSwitchyard';
import { createProjectBox } from '../utility-container/projectBoxFactory';

const now = Date.now();

const validBox = createProjectBox({
  domain: "SMART_CITY",
  category: "verified_infrastructure_movement",
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

const result = attemptExecution({
  eventId: "EVT-2",

  projectBox: validBox,

  permission: {
    actor: "HARD",
    action: "route_execution",
    target: "activation"
  },

  context: {
    artifactId: validBox.artifactId,
    lastVerifiedAt: now - 1000,
    currentTime: now,
    dependenciesValid: true,
    sequenceValid: true
  }
});

console.log("FULL_STACK_EXECUTION_TEST");
console.log(result);
