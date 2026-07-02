import { attemptExecution } from './executionSwitchyard';
import { stableHash } from './stableHash';
import { createProjectBox } from '../utility-container/projectBoxFactory';

const now = Date.now();

const box = createProjectBox({
  domain: "SMART_CITY",
  category: "decision_bound_execution",
  tags: ["custody","routing","schedule","transaction","provenance","agent_policy","human_override"],
  custodyRequired: true,
  routingRequired: true,
  schedulingRequired: true,
  transactionRequired: true
});

const currentContext = {
  artifactId: box.artifactId,
  lastVerifiedAt: now,
  currentTime: now,
  dependenciesValid: true,
  sequenceValid: true
};

const currentDependencies = {
  projectBox: box.artifactId,
  utilityProfile: "SMART_CITY",
  ledger: "PERSISTENT_LEDGER"
};

const contextHash = stableHash(currentContext);
const dependenciesHash = stableHash(currentDependencies);

function baseInput(overrides: any = {}) {
  return {
    eventId: overrides.eventId || "DECISION_BINDING_APPROVED",
    module: "CORE",
    identityUsage: {
      identityId: "ID-DECISION",
      assetId: "ASSET-DECISION",
      usageId: "USE-DECISION",
      zoneType: "GOVERNED_ZONE",
      consent: true,
      scopeMatched: true,
      attributionPresent: true,
      valueRoutingPresent: true,
      presenceSignal: true,
      contributionLayers: ["SOURCE","TRACE"]
    },
    projectBox: box,
    permission: {
      actor: "HARD",
      action: "route_execution",
      target: "decision_bound_execution"
    },
    context: currentContext,
    decisionBinding: {
      decisionId: overrides.decisionId || "DECISION-001",
      artifactId: box.artifactId,
      decisionArtifactId: overrides.decisionArtifactId || box.artifactId,
      decisionTimestamp: overrides.decisionTimestamp || now,
      currentTimestamp: now,
      maxAgeMs: 60000,
      superseded: overrides.superseded || false,
      contextHashAtDecision: overrides.contextHashAtDecision || contextHash,
      currentContextHash: contextHash,
      dependenciesHashAtDecision: overrides.dependenciesHashAtDecision || dependenciesHash,
      currentDependenciesHash: dependenciesHash
    }
  };
}

console.log("DECISION_BINDING_GATE_V1=START");

console.log("----");
console.log("APPROVED_DECISION_BINDING");
console.log(attemptExecution(baseInput()));

console.log("----");
console.log("STALE_DECISION_BINDING");
console.log(attemptExecution(baseInput({
  eventId: "DECISION_BINDING_STALE",
  decisionTimestamp: now - 120000
})));

console.log("----");
console.log("SUPERSEDED_DECISION_BINDING");
console.log(attemptExecution(baseInput({
  eventId: "DECISION_BINDING_SUPERSEDED",
  superseded: true
})));

console.log("----");
console.log("CONTEXT_DRIFT_DECISION_BINDING");
console.log(attemptExecution(baseInput({
  eventId: "DECISION_BINDING_CONTEXT_DRIFT",
  contextHashAtDecision: "OLD_CONTEXT_HASH"
})));

console.log("----");
console.log("ARTIFACT_MISMATCH_DECISION_BINDING");
console.log(attemptExecution(baseInput({
  eventId: "DECISION_BINDING_ARTIFACT_MISMATCH",
  decisionArtifactId: "WRONG_ARTIFACT"
})));

console.log("DECISION_BINDING_GATE_V1=COMPLETE");
