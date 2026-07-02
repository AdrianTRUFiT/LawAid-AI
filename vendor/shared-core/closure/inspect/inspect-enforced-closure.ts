import type { ClosureDecisionEnvelope } from '../contracts/closureDecisionEnvelope'

export function inspectEnforcedClosure(envelope: ClosureDecisionEnvelope) {
  return {
    closureId: envelope.closureId,
    enforcedClosureState: envelope.result.enforcedClosureState,
    enforcementReasons: envelope.result.enforcementReasons,
    finalConnectionHonored: envelope.result.finalConnectionHonored
  }
}
