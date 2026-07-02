export type ADPInputState = "PRESENT" | "MISSING" | "INCOMPLETE";
export type AIRInputState = "SAFE" | "HOLD" | "REFUSED";
export type ConsequenceDecisionState = "PROCEED" | "HOLD" | "REFUSED";
export type ApprovalAuthority = "Adrian" | "System";

export interface ConsequenceGovernanceInput {
  adpResult: ADPInputState;
  airResult: AIRInputState;
  contextOverride?: string;
  overrideAuthority?: "MAIN";
}

export interface ConsequenceGovernanceOutput {
  decision: ConsequenceDecisionState;
  reason: string;
  requiresApproval: boolean;
  approvalAuthority: ApprovalAuthority;
  governedAt: string;
}

export interface ConsequenceGovernanceDecision {
  input: ConsequenceGovernanceInput;
  output: ConsequenceGovernanceOutput;
}
