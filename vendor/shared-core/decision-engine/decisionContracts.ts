export type DecisionStatus = "READY" | "QUERY_INCOMPLETE";
export type DecisionState = "PROCEED" | "HOLD" | "REFUSED";

export interface ExecutiveDecisionQuestion {
  question: string;
  requestedBy?: string;
}

export interface DecisionProjectState {
  name: string;
  product_status?: string;
  completion_percent?: number;
  launch_readiness?: string;
  blockers?: string[];
  dependencies?: string[];
  nextAction?: string;
}

export interface DecisionOption {
  option: string;
  rationale: string;
}

export interface ConsequenceMapItem {
  action: string;
  consequence: string;
}

export interface DecisionPacket {
  decisionQuestion: string;
  verifiedStateUsed: string[];
  project?: DecisionProjectState;
  decisionOptions: DecisionOption[];
  consequenceMap: ConsequenceMapItem[];
  recommendedActionPath: string[];
  missingIntelligence: string[];
  status: DecisionStatus;
  decisionState: DecisionState;
}
