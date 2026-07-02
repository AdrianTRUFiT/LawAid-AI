import type { DistrictAdapterManifest } from "./contracts.js";

export function createLawAidAIManifest(): DistrictAdapterManifest {
  return {
    districtType: "LAWAIDAI",
    displayName: "LawAidAI Adapter",
    ownsInfrastructure: false,
    consumesLiveSystemRecord: true,
    domainFocus: "Legal client-side management and position protection.",
  };
}

export function createTravelFlowManifest(): DistrictAdapterManifest {
  return {
    districtType: "TRAVELFLOW",
    displayName: "TravelFlow Adapter",
    ownsInfrastructure: false,
    consumesLiveSystemRecord: true,
    domainFocus: "Travel orchestration and movement continuity.",
  };
}

export function createGenericDistrictManifest(): DistrictAdapterManifest {
  return {
    districtType: "GENERIC",
    displayName: "Generic District Adapter",
    ownsInfrastructure: false,
    consumesLiveSystemRecord: true,
    domainFocus: "Domain-neutral receiving adapter.",
  };
}