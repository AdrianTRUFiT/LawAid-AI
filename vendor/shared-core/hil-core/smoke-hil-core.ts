import { attemptExecution } from './executionSwitchyard';

const now = Date.now();

const result = attemptExecution({
  eventId: "EVT-1",
  artifactId: "A1",

  permission: {
    actor: "HARD",
    action: "route_execution",
    target: "activation"
  },

  context: {
    artifactId: "A1",
    lastVerifiedAt: now - 1000,
    currentTime: now,
    dependenciesValid: true,
    sequenceValid: true
  }
});

console.log("HIL_EXECUTION_TEST");
console.log(result);
