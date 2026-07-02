import type { ClosureInputs } from './closureStateContracts'
import { ClosureReasonCodes } from './closureReasonCodes'

export function validateClosureRelease(input: ClosureInputs): string[] {
  const reasons: string[] = []

  if (!input.releaseValid) {
    reasons.push(ClosureReasonCodes.RELEASE_PREMATURE)
  }

  if (!input.runtimeReady) {
    reasons.push(ClosureReasonCodes.RUNTIME_NOT_READY)
  }

  if (!input.governanceReady) {
    reasons.push(ClosureReasonCodes.GOVERNANCE_NOT_READY)
  }

  return reasons
}
