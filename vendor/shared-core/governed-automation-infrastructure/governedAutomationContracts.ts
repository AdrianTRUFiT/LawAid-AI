export type GovernedState = "SAFE" | "HOLD" | "REFUSED";

export type AutomationLayer =
  | "AGENTIC_AI"
  | "ROBOTICS"
  | "ARI"
  | "GEL"
  | "TIS"
  | "VAP"
  | "PROOFBACK_RECORDS"
  | "JOURNAL"
  | "PAID"
  | "MAID"
  | "HUMAN_CUSTODY";

export type LayerClass =
  | "CAPABILITY"
  | "READINESS"
  | "WORK"
  | "ECONOMIC_CONSEQUENCE"
  | "PROOF"
  | "HUMAN_AUTHORITY";

export interface GovernedAutomationRequest {
  actorLayer: AutomationLayer;
  requestedConsequenceExecution: boolean;
  ariReady: boolean;
  tisAuthority: boolean;
  vapProofReady: boolean;
  humanCustodyPresent: boolean;
  humanCustodyRequired: boolean;
}

export interface GovernedAutomationReadinessPacket {
  state: GovernedState;
  category: "Governed Automation Infrastructure";
  layerStatus: Record<string, boolean | string>;
  missingGovernanceRequirements: string[];
  consequenceEligible: boolean;
  proofRequired: boolean;
  humanCustodyRequired: boolean;
  refusalCodes: string[];
  doctrine: string;
}
