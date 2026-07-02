import { GIRTransitionInput } from "./girContracts";

export function evaluateGIRPolicy(input: GIRTransitionInput): string[] {
  const reasons: string[] = [];

  if (!input.signalPresent && input.targetStage !== "SIGNAL") {
    reasons.push("SIGNAL_REQUIRED");
  }

  if (input.targetStage === "DECISION" && !input.readinessPassed) {
    reasons.push("READINESS_REQUIRED_BEFORE_DECISION");
  }

  if (input.targetStage === "VERIFICATION" && !input.decisionCreated) {
    reasons.push("DECISION_REQUIRED_BEFORE_VERIFICATION");
  }

  if (input.targetStage === "ACTION" && !input.readinessPassed) {
    reasons.push("READINESS_REQUIRED_BEFORE_ACTION");
  }

  if (input.targetStage === "ACTION" && !input.verificationPassed) {
    reasons.push("VERIFICATION_REQUIRED_BEFORE_ACTION");
  }

  if (input.targetStage === "PROOF" && !input.actionCompleted) {
    reasons.push("ACTION_REQUIRED_BEFORE_PROOF");
  }

  if (input.targetStage === "EXPANSION" && !input.proofEmitted) {
    reasons.push("PROOF_REQUIRED_BEFORE_EXPANSION");
  }

  if (input.targetStage === "LEARNING" && !input.expansionGenerated) {
    reasons.push("EXPANSION_REQUIRED_BEFORE_LEARNING");
  }

  return reasons;
}
