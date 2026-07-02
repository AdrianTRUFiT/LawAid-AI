import type { ConsumerMindSetCatalogItem } from "../contracts/launchLaneContracts";

export const CONSUMER_MINDSET_CATALOG: ConsumerMindSetCatalogItem[] = [
  {
    mindsetId: "LAWAIDAI",
    label: "LawAidAI",
    receiver: "LAWAIDAI",
    painPoint: "organize legal case and client-side legal workflow",
    paidEligible: true,
    paiSafeRequired: true,
    active: true
  },
  {
    mindsetId: "TRAVELFLOWAI",
    label: "TravelFlowAI",
    receiver: "TRAVELFLOWAI",
    painPoint: "travel disruption support, continuity, proof, and trip state",
    paidEligible: true,
    paiSafeRequired: true,
    active: true
  }
];