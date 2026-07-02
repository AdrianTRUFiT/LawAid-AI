import { evaluateHilDegradation } from '../../../vendor/shared-core/hil-degradation/hilDegradationGuard'
import type {
  HilDegradationInput,
  HilDegradationResult
} from '../../../vendor/shared-core/hil-degradation/hilDegradationContracts'

export type ActivationDegradationDecision = {
  allowed: boolean
  route: 'CONTINUE' | 'SAFE_HOLD' | 'REFUSE'
  degradation: HilDegradationResult
}

export function evaluateActivationDegradation(
  input: HilDegradationInput
): ActivationDegradationDecision {
  const degradation = evaluateHilDegradation(input)

  if (degradation.decision === 'ALLOW') {
    return {
      allowed: true,
      route: 'CONTINUE',
      degradation
    }
  }

  if (degradation.decision === 'HOLD') {
    return {
      allowed: false,
      route: 'SAFE_HOLD',
      degradation
    }
  }

  return {
    allowed: false,
    route: 'REFUSE',
    degradation
  }
}

