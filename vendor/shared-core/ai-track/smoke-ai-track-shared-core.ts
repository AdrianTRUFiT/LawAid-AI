import { evaluateIdentityUsage } from './identityUsageEngine';
import { createIdentityUsageTrace } from './identityUsageTrace';

const cases = [
  {
    name: "GOVERNED_APPROVED",
    input: {
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
    }
  },
  {
    name: "GOVERNED_NO_CONSENT_REFUSED",
    input: {
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
    }
  },
  {
    name: "FREE_EXPRESSION_ALLOWED_NO_CONSEQUENCE",
    input: {
      identityId: "ID-003",
      assetId: "ASSET-003",
      usageId: "USE-003",
      zoneType: "FREE_EXPRESSIVE_ZONE",
      consent: false,
      scopeMatched: false,
      attributionPresent: false,
      valueRoutingPresent: false,
      presenceSignal: false,
      contributionLayers: ["SOURCE"]
    }
  },
  {
    name: "COMMONS_ATTRIBUTION_HELD",
    input: {
      identityId: "ID-004",
      assetId: "ASSET-004",
      usageId: "USE-004",
      zoneType: "COMMONS_ZONE",
      consent: false,
      scopeMatched: false,
      attributionPresent: false,
      valueRoutingPresent: false,
      presenceSignal: false,
      contributionLayers: ["SOURCE", "USE"]
    }
  }
];

console.log("AI_TRACK_SHARED_CORE_V1=START");

for (const c of cases) {
  console.log("----");
  console.log(c.name);
  const result = evaluateIdentityUsage(c.input as any);
  console.log(result);
  console.log(createIdentityUsageTrace(c.input as any, result));
}

console.log("AI_TRACK_SHARED_CORE_V1=COMPLETE");
