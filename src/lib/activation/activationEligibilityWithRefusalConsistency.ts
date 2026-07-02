import { unifiedRefusalGate } from '../../../vendor/shared-core/enforcement/unifiedRefusalGate';
import { verifyRefusalConsistency } from '../../../vendor/shared-core/enforcement/refusalConsistencyVerifier';
import type { UnifiedRefusalInput } from '../../../vendor/shared-core/enforcement/refusalDecisionContracts';

export type ActivationEligibilityConsistencyResult = {
  activationEligible: boolean;
  activationState: 'ALLOW' | 'HOLD_PROTECTED' | 'REFUSE_HARD';
  enforcementReasonCode: string;
  consistencyState: 'CONSISTENT' | 'INCONSISTENT';
  consistencyReasonCode: string;
};

function expectedReasonPrefix(state: 'ALLOW' | 'HOLD_PROTECTED' | 'REFUSE_HARD') {
  if (state === 'ALLOW') return 'ALLOW_';
  if (state === 'HOLD_PROTECTED') return 'HOLD_PROTECTED_';
  return 'REFUSE_HARD_';
}

export function evaluateActivationEligibilityWithRefusalConsistency(
  input: UnifiedRefusalInput,
  artifactId: string,
  contextId: string
): ActivationEligibilityConsistencyResult {
  const decision = unifiedRefusalGate(input);

  const actualState =
    decision.result === 'REFUSE_RECOVERABLE'
      ? 'REFUSE_HARD'
      : decision.result;

  const consistency = verifyRefusalConsistency({
    expectedState: actualState,
    actualState,
    expectedReasonPrefix: expectedReasonPrefix(actualState),
    actualReasonCode: decision.reasonCode,
    artifactId,
    contextId
  });

  if (actualState === 'ALLOW' && consistency.consistent) {
    return {
      activationEligible: true,
      activationState: 'ALLOW',
      enforcementReasonCode: decision.reasonCode,
      consistencyState: consistency.result,
      consistencyReasonCode: consistency.reasonCode
    };
  }

  if (actualState === 'HOLD_PROTECTED' && consistency.consistent) {
    return {
      activationEligible: false,
      activationState: 'HOLD_PROTECTED',
      enforcementReasonCode: decision.reasonCode,
      consistencyState: consistency.result,
      consistencyReasonCode: consistency.reasonCode
    };
  }

  return {
    activationEligible: false,
    activationState: 'REFUSE_HARD',
    enforcementReasonCode: decision.reasonCode,
    consistencyState: consistency.result,
    consistencyReasonCode: consistency.reasonCode
  };
}
