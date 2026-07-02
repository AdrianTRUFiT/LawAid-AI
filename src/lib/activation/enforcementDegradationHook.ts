import { evaluateActivationDegradation } from './activationDegradationGate'
import type { HilDegradationInput } from '../../../vendor/shared-core/hil-degradation/hilDegradationContracts'

export type LiveRecordCandidate = {
  liveRecordId: string
  activationEnvelopeId: string
  matterId: string
}

export type EnforcementDegradationHookResult = {
  activationPermitted: boolean
  writePermitted: boolean
  route: 'CONTINUE' | 'SAFE_HOLD' | 'REFUSE'
  reasonCode: string
  liveRecordCandidate: LiveRecordCandidate | null
}

export function runEnforcementDegradationHook(
  input: HilDegradationInput,
  candidate: LiveRecordCandidate
): EnforcementDegradationHookResult {
  const result = evaluateActivationDegradation(input)

  if (result.route === 'CONTINUE') {
    return {
      activationPermitted: true,
      writePermitted: true,
      route: 'CONTINUE',
      reasonCode: result.degradation.reasonCode,
      liveRecordCandidate: candidate
    }
  }

  if (result.route === 'SAFE_HOLD') {
    return {
      activationPermitted: false,
      writePermitted: false,
      route: 'SAFE_HOLD',
      reasonCode: result.degradation.reasonCode,
      liveRecordCandidate: null
    }
  }

  return {
    activationPermitted: false,
    writePermitted: false,
    route: 'REFUSE',
    reasonCode: result.degradation.reasonCode,
    liveRecordCandidate: null
  }
}

