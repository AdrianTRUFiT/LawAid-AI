import { canSystemExecute } from '../failure-map/failureEvaluator';

export function enforceSystemHealth(states: any[]) {
  const result = canSystemExecute(states);

  if (!result.canExecute) {
    return {
      decision: "REFUSE",
      reason: "SYSTEM_FAILURE_BLOCK",
      blockers: result.blockers
    };
  }

  return {
    decision: "ALLOW",
    reason: "SYSTEM_HEALTH_VERIFIED"
  };
}
