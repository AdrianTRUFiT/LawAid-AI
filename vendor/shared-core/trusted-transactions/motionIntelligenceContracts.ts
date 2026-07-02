export type MotionTransition =
  | "CREATE_CONTAINER"
  | "PLAN_ROUTE"
  | "ENTER_TRANSPORT"
  | "PASS_CHECKPOINT"
  | "HOLD"
  | "REROUTE"
  | "REFUSE"
  | "BLOCK_REPLAY"
  | "APPROVE_FOR_TRUTH_REVIEW";

export type MotionIntelligencePlan = {
  miPlanId: string;
  micId: string;
  routeType: "STANDARD" | "EXPEDITED" | "HUMAN_REVIEW" | "SIMULATED";
  checkpointSequence: string[];
  allowedTransitions: MotionTransition[];
  holdRules: string[];
  releaseRules: string[];
  rerouteRules: string[];
  exceptionRules: string[];
  syncRules: string[];
  expiresAt: string;
  status: "ROUTE_PLANNED";
  sealsTruth: false;
};

export function isMiPlanExpired(plan: MotionIntelligencePlan, nowIso: string): boolean {
  return Date.parse(plan.expiresAt) <= Date.parse(nowIso);
}
