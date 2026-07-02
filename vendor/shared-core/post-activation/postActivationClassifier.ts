import type { PostActivationResult } from './postActivationContracts'

export function classifyPostActivation(result: PostActivationResult) {
  return {
    state: result.state,
    decision: result.decision,
    propagationAllowed: result.propagationAllowed,
    reasonCode: result.reasonCode
  }
}
