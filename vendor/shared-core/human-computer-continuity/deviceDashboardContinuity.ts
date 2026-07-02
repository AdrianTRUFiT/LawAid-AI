import { ContinuityDecision, HumanComputerEntrySignal } from './continuityContracts';
import { evaluateHumanComputerContinuity } from './continuityEngine';

export type DeviceDashboardContinuityViewModel = {
  signalId: string;
  dashboardSurface: string;
  status: ContinuityDecision['status'];
  movementAllowed: boolean;
  visibleMessage: string;
  passedConditions: string[];
  blockedConditions: string[];
  doctrine: string;
};

export function buildDeviceDashboardContinuityViewModel(
  signal: HumanComputerEntrySignal
): DeviceDashboardContinuityViewModel {
  const decision = evaluateHumanComputerContinuity(signal);

  let visibleMessage = 'Entry captured. Continue by clarifying intent.';

  if (decision.status === 'needs_clarity') {
    visibleMessage = 'Your signal is captured. Clarify the intent before the system can move it forward.';
  }

  if (decision.status === 'needs_authorship') {
    visibleMessage = 'Intent is structured. Verify authorship before this can become trusted movement.';
  }

  if (decision.status === 'needs_authority') {
    visibleMessage = 'Authorship is verified. Human approval and the required artifact are needed before consequence.';
  }

  if (decision.status === 'open') {
    visibleMessage = 'Continuity conditions are satisfied. Movement may continue through governed artifact law.';
  }

  return {
    signalId: signal.signalId,
    dashboardSurface: signal.dashboardSurface,
    status: decision.status,
    movementAllowed: decision.movementAllowed,
    visibleMessage,
    passedConditions: decision.passedConditions,
    blockedConditions: decision.failedConditions,
    doctrine: decision.doctrine
  };
}
