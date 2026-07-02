import { GIRRuntimeResult, GIRTransitionInput } from "./girContracts";
import { isLegalNextStage } from "./girStateMachine";
import { evaluateGIRPolicy } from "./girPolicy";

export function runGIRTransition(input: GIRTransitionInput): GIRRuntimeResult {
  const refusalReasons = evaluateGIRPolicy(input);

  if (!isLegalNextStage(input.currentStage, input.targetStage)) {
    refusalReasons.push("ILLEGAL_STAGE_TRANSITION");
  }

  const resultState = refusalReasons.length > 0 ? "REFUSED" : "SAFE";

  return {
    domain: input.domain,
    currentStage: input.currentStage,
    targetStage: input.targetStage,
    resultState,
    eligibleToProceed: resultState === "SAFE",
    refusalReasons,
    auditSummary:
      resultState === "SAFE"
        ? `${input.domain}: ${input.currentStage} -> ${input.targetStage} eligible.`
        : `${input.domain}: ${input.currentStage} -> ${input.targetStage} refused: ${refusalReasons.join(", ")}`
  };
}
