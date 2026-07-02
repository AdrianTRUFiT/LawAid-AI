import { unifiedRefusalGate } from '../../../vendor/shared-core/enforcement/unifiedRefusalGate';
import type { UnifiedRefusalInput } from '../../../vendor/shared-core/enforcement/refusalDecisionContracts';

export type ActivationGateResult = {
  activationAllowed: boolean;
  route: 'ALLOW' | 'HOLD_PROTECTED' | 'REFUSE_HARD';
  reasonCode: string;
};

export function globalActivationEnforcement(input: UnifiedRefusalInput): ActivationGateResult {
  const decision = unifiedRefusalGate(input);

  if (decision.result === 'ALLOW') {
    return {
      activationAllowed: true,
      route: 'ALLOW',
      reasonCode: decision.reasonCode
    };
  }

  if (decision.result === 'HOLD_PROTECTED') {
    return {
      activationAllowed: false,
      route: 'HOLD_PROTECTED',
      reasonCode: decision.reasonCode
    };
  }

  return {
    activationAllowed: false,
    route: 'REFUSE_HARD',
    reasonCode: decision.reasonCode
  };
}
