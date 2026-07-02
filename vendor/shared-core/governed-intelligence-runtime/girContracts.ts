export type GIRStage =
  | "SIGNAL"
  | "READINESS"
  | "DECISION"
  | "VERIFICATION"
  | "ACTION"
  | "PROOF"
  | "EXPANSION"
  | "LEARNING";

export type GIRResultState = "SAFE" | "HOLD" | "REFUSED";

export interface GIRTransitionInput {
  domain: string;
  currentStage: GIRStage;
  targetStage: GIRStage;
  signalPresent?: boolean;
  readinessPassed?: boolean;
  decisionCreated?: boolean;
  verificationPassed?: boolean;
  actionCompleted?: boolean;
  proofEmitted?: boolean;
  expansionGenerated?: boolean;
  learningCreated?: boolean;
}

export interface GIRRuntimeResult {
  domain: string;
  currentStage: GIRStage;
  targetStage: GIRStage;
  resultState: GIRResultState;
  eligibleToProceed: boolean;
  refusalReasons: string[];
  auditSummary: string;
}
