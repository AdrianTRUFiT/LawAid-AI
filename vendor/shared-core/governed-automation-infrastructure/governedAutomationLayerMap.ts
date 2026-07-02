import { AutomationLayer, LayerClass } from "./governedAutomationContracts";

export const governedAutomationLayerMap: Record<AutomationLayer, LayerClass> = {
  AGENTIC_AI: "CAPABILITY",
  ROBOTICS: "CAPABILITY",
  ARI: "READINESS",
  GEL: "WORK",
  TIS: "ECONOMIC_CONSEQUENCE",
  VAP: "PROOF",
  PROOFBACK_RECORDS: "PROOF",
  JOURNAL: "PROOF",
  PAID: "HUMAN_AUTHORITY",
  MAID: "HUMAN_AUTHORITY",
  HUMAN_CUSTODY: "HUMAN_AUTHORITY"
};

export function isCapabilityLayer(layer: AutomationLayer): boolean {
  return governedAutomationLayerMap[layer] === "CAPABILITY";
}
