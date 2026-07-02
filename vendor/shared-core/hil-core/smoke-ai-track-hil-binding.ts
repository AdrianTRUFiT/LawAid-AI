import { attemptExecution } from './executionSwitchyard';
import { createProjectBox } from '../utility-container/projectBoxFactory';

const now = Date.now();

const box = createProjectBox({
  domain: "SMART_CITY",
  category: "ai_track_identity_bound_execution",
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

const approved = attemptExecution({
  eventId: "AI_TRACK_IDENTITY_LOCK_APPROVED",
  module: "AI_TRACK",
  identityUsage: {
    identityId: "ID-001",
    assetId: "ASSET-001",
    usageId: "USE-001",
    zoneType: "GOVERNED_ZONE",
    consent: true,
    scopeMatched: true,
    attributionPresent: true,
    valueRoutingPresent: true,
    presenceSignal: true,
    contributionLayers: ["SOURCE", "USE", "AUTHORITY", "VALUE", "TRACE"]
  },
  projectBox: box,
  permission: {
    actor: "HARD",
    action: "route_execution",
    target: "ai_track_identity_execution"
  },
  context: {
    artifactId: box.artifactId,
    lastVerifiedAt: now - 1000,
    currentTime: now,
    dependenciesValid: true,
    sequenceValid: true
  }
});

const refused = attemptExecution({
  eventId: "AI_TRACK_IDENTITY_LOCK_REFUSED",
  module: "AI_TRACK",
  identityUsage: {
    identityId: "ID-002",
    assetId: "ASSET-002",
    usageId: "USE-002",
    zoneType: "GOVERNED_ZONE",
    consent: false,
    scopeMatched: true,
    attributionPresent: true,
    valueRoutingPresent: true,
    presenceSignal: true,
    contributionLayers: ["SOURCE", "TRACE"]
  },
  projectBox: box,
  permission: {
    actor: "HARD",
    action: "route_execution",
    target: "ai_track_identity_execution"
  },
  context: {
    artifactId: box.artifactId,
    lastVerifiedAt: now - 1000,
    currentTime: now,
    dependenciesValid: true,
    sequenceValid: true
  }
});

console.log("AI_TRACK_HIL_BINDING_V1=START");
console.log("----");
console.log("APPROVED_IDENTITY_USAGE");
console.log(approved);
console.log("----");
console.log("REFUSED_IDENTITY_USAGE");
console.log(refused);
console.log("AI_TRACK_HIL_BINDING_V1=COMPLETE");
