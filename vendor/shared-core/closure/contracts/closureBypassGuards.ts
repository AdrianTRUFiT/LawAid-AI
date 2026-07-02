import type { ClosureInputs } from './closureStateContracts'
import { ClosureReasonCodes } from './closureReasonCodes'

export function validateClosureBypass(input: ClosureInputs): string[] {
  return input.bypassDetected
    ? [ClosureReasonCodes.BYPASS_ATTEMPT_DETECTED]
    : []
}
