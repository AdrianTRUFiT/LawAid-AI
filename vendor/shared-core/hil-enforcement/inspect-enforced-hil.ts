import type { HilEnforcementResult } from './hilEnforcementContracts'

export function inspectEnforcedHil(result: HilEnforcementResult) {
  return {
    enforcedCloseState: result.enforcedCloseState,
    enforcementReasons: result.enforcementReasons,
    appendOnlyRecorded: result.appendOnlyRecorded,
    protectedWriteIntact: result.protectedWriteIntact,
    finalPathClosed: result.finalPathClosed
  }
}
