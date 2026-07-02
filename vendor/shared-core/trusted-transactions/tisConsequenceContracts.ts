export type TisConsequenceDecision =
  | "APPROVED"
  | "HELD"
  | "REFUSED"
  | "REPLAY_ATTACK";

export type TisConsequenceEvaluation = {
  tisEvaluationId: string;
  micId: string;
  transportId: string;
  evaluatedState: string;
  decision: TisConsequenceDecision;
  decisionReason: string;
  missingArtifacts: string[];
  riskSignals: string[];
  replaySignals: string[];
  releaseConditions: string[];
  timestamp: string;
  authorityBoundary: "CONSEQUENCE_READINESS_ONLY";
  sealsFinancialTruth: false;
};

export function assertTisBoundary(evaluation: TisConsequenceEvaluation): true {
  if (evaluation.authorityBoundary !== "CONSEQUENCE_READINESS_ONLY") {
    throw new Error("TIS_BOUNDARY_BREACH: TIS authority boundary changed.");
  }
  if (evaluation.sealsFinancialTruth !== false) {
    throw new Error("TIS_BOUNDARY_BREACH: TIS must not seal financial truth.");
  }
  return true;
}
