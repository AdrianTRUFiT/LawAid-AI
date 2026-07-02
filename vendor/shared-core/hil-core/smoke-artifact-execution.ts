import { registerArtifact } from '../artifact-registry/artifactRegistry';
import { attemptExecution } from './executionSwitchyard';
import { createProjectBox } from '../utility-container/projectBoxFactory';

const now = Date.now();

const box = createProjectBox({
  domain: "SMART_CITY",
  category: "artifact_bound_execution",
  tags: ["custody","routing","schedule","transaction","provenance","agent_policy","human_override"],
  custodyRequired: true,
  routingRequired: true,
  schedulingRequired: true,
  transactionRequired: true
});

registerArtifact({
  artifactId: box.artifactId,
  type: "PROJECT_BOX"
});

const result = attemptExecution({
  eventId: "ARTIFACT_VERIFIED_EXECUTION",
  module: "CORE",
  identityUsage: {
    identityId: "ID-100",
    assetId: "ASSET-100",
    usageId: "USE-100",
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
    target: "artifact_execution"
  },
  context: {
    artifactId: box.artifactId,
    lastVerifiedAt: now,
    currentTime: now,
    dependenciesValid: true,
    sequenceValid: true
  }
});

console.log("ARTIFACT_EXECUTION_TEST");
console.log(result);
