import { runPaccCheck } from '../pacc';
import { getPaccMode } from './paccControlState';

export function runPaccWithControl(signal: any) {
  const mode = getPaccMode();

  if (mode === 'OFF') {
    return {
      state: 'ALLOW',
      riskLevel: 'NONE',
      allowed: true,
      consequenceAllowed: false,
      reason: 'PACC_DISABLED',
      requiredNextStep: 'CONTINUE',
      createdAt: new Date().toISOString(),
      signal
    };
  }

  const decision = runPaccCheck(signal);

  if (mode === 'LIMITED') {
    if (decision.state === 'NUDGE' || decision.state === 'PAUSE') {
      return {
        ...decision,
        state: 'ALLOW',
        reason: 'PACC_LIMITED_MODE_SOFT_INTERVENTION_BYPASSED'
      };
    }
  }

  return decision;
}
