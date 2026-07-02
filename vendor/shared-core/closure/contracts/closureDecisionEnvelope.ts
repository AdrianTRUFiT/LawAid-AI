import type { ClosureInputs, EnforcedClosureState } from './closureStateContracts'

export type ClosureDecisionEnvelope = {
  closureId: string
  inputs: ClosureInputs
  result: EnforcedClosureState
  evaluatedAt: string
}
