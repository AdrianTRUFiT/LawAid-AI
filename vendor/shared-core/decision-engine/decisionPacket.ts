import {
  DecisionPacket,
  DecisionProjectState,
  ExecutiveDecisionQuestion
} from "./decisionContracts";

export function createDecisionPacket(input: {
  request: ExecutiveDecisionQuestion;
  project?: DecisionProjectState;
  missingIntelligence: string[];
}): DecisionPacket {
  const { request, project, missingIntelligence } = input;

  if (!project) {
    return {
      decisionQuestion: request.question,
      verifiedStateUsed: [],
      decisionOptions: [],
      consequenceMap: [],
      recommendedActionPath: [],
      missingIntelligence: ["No matching project found in PROJECT_REGISTRY"],
      status: "QUERY_INCOMPLETE",
      decisionState: "HOLD"
    };
  }

  if (missingIntelligence.length > 0) {
    return {
      decisionQuestion: request.question,
      verifiedStateUsed: ["PROJECT_REGISTRY"],
      project,
      decisionOptions: [],
      consequenceMap: missingIntelligence.map((m) => ({
        action: "Proceed without missing intelligence",
        consequence: `Blocked: ${m}`
      })),
      recommendedActionPath: ["Populate missing registry intelligence before decision execution."],
      missingIntelligence,
      status: "QUERY_INCOMPLETE",
      decisionState: "HOLD"
    };
  }

  const blockers = project.blockers || [];
  const canProceed =
    project.launch_readiness === "CANDIDATE" &&
    project.product_status === "IN_PROGRESS" &&
    blockers.length === 0;

  const decisionState = canProceed ? "PROCEED" : blockers.length > 0 ? "HOLD" : "HOLD";

  return {
    decisionQuestion: request.question,
    verifiedStateUsed: ["PROJECT_REGISTRY"],
    project,
    decisionOptions: [
      {
        option: "Continue governed readiness work",
        rationale: project.nextAction || "Next action is available from verified project registry."
      },
      {
        option: "Hold launch movement",
        rationale: blockers.length
          ? "Known blockers remain in the project registry."
          : "Launch readiness does not yet authorize consequence movement."
      }
    ],
    consequenceMap: [
      {
        action: "Proceed immediately",
        consequence: blockers.length
          ? "May create consequence without resolving known blockers."
          : "Permitted only if readiness, authority, proof, and custody remain satisfied."
      },
      {
        action: "Complete nextAction first",
        consequence: "Maintains governed readiness path and reduces launch risk."
      }
    ],
    recommendedActionPath: project.nextAction ? [project.nextAction] : ["Define nextAction in PROJECT_REGISTRY"],
    missingIntelligence: [],
    status: "READY",
    decisionState
  };
}
