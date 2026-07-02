import type { ClosureInputs, EnforcedClosureState } from './closureStateContracts'
import { ClosureReasonCodes } from './closureReasonCodes'

export function applyClosureOverridePolicy(
  input: ClosureInputs,
  result: EnforcedClosureState
): EnforcedClosureState {
  if (result.enforcedClosureState === 'HELD' && !input.attestationPresent) {
    return {
      ...result,
      overrideApplied: false,
      overrideType: 'ATTESTATION_REQUIRED',
      attestationRequired: true,
      enforcementReasons: [...result.enforcementReasons, ClosureReasonCodes.ATTESTATION_REQUIRED],
      fallbackOrEscalationRoute: result.fallbackOrEscalationRoute === 'NONE'
        ? 'REVIEW_QUEUE'
        : result.fallbackOrEscalationRoute
    }
  }

  if (result.enforcedClosureState === 'CONSTRAINED') {
    return {
      ...result,
      overrideApplied: false,
      overrideType: 'MANUAL_REVIEW_ONLY',
      fallbackOrEscalationRoute: result.fallbackOrEscalationRoute === 'NONE'
        ? 'RIGHTS_REVIEW'
        : result.fallbackOrEscalationRoute
    }
  }

  return result
}
