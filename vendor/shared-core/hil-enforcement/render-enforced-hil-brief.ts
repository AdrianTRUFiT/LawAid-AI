import type { HilEnforcementResult } from './hilEnforcementContracts'

export function renderEnforcedHilBrief(result: HilEnforcementResult): string {
  const reasons = result.enforcementReasons.length > 0
    ? result.enforcementReasons.join(', ')
    : 'NONE'

  return [
    'STATE=' + result.enforcedCloseState,
    'CLOSED=' + String(result.finalPathClosed),
    'APPEND_ONLY=' + String(result.appendOnlyRecorded),
    'PROTECTED_WRITE=' + String(result.protectedWriteIntact),
    'REASONS=' + reasons
  ].join(' | ')
}
