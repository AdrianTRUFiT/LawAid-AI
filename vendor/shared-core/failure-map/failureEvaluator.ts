import { FAILURE_RULES, FailureRule, ModuleState } from './failureRules';

export function evaluateFailureState(module: string, state: ModuleState): FailureRule {
  const match = FAILURE_RULES.find(r => r.module === module && r.state === state);

  if (match) {
    return match;
  }

  if (state === "ONLINE") {
    return {
      module,
      state,
      action: "CONTINUE",
      reason: "MODULE_HEALTHY",
      canExecuteConsequence: true,
      canDisplayFrontend: true,
      canWriteLedger: true
    };
  }

  return {
    module,
    state,
    action: "REQUIRE_REVALIDATION",
    reason: "NO_EXPLICIT_FAILURE_RULE",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  };
}

export function canSystemExecute(states: { module: string; state: ModuleState }[]) {
  const evaluations = states.map(s => evaluateFailureState(s.module, s.state));
  const blockers = evaluations.filter(e => !e.canExecuteConsequence);

  return {
    canExecute: blockers.length === 0,
    blockers,
    evaluations
  };
}
