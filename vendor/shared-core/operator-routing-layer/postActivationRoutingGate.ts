import { verifyPostActivation } from '../post-activation/postActivationVerifier'
import { mapPostActivationRefusal } from '../post-activation/postActivationRefusal'
import type { PostActivationInput } from '../post-activation/postActivationContracts'

export type PostActivationRoutingDecision = {
  routingAllowed: boolean
  routingState:
    | 'ROUTE_CONTINUE'
    | 'ROUTE_HOLD'
    | 'ROUTE_REFUSE'
    | 'ROUTE_BLOCK_PROPAGATION'
  reasonCode: string
  postActivationState: string
}

export function evaluatePostActivationRouting(
  input: PostActivationInput
): PostActivationRoutingDecision {
  const verification = verifyPostActivation(input)
  const mapped = mapPostActivationRefusal(verification)

  if (mapped.route === 'CONTINUE') {
    return {
      routingAllowed: true,
      routingState: 'ROUTE_CONTINUE',
      reasonCode: verification.reasonCode,
      postActivationState: verification.state
    }
  }

  if (mapped.route === 'SAFE_HOLD') {
    return {
      routingAllowed: false,
      routingState: 'ROUTE_HOLD',
      reasonCode: verification.reasonCode,
      postActivationState: verification.state
    }
  }

  if (mapped.route === 'BLOCK_PROPAGATION') {
    return {
      routingAllowed: false,
      routingState: 'ROUTE_BLOCK_PROPAGATION',
      reasonCode: verification.reasonCode,
      postActivationState: verification.state
    }
  }

  return {
    routingAllowed: false,
    routingState: 'ROUTE_REFUSE',
    reasonCode: verification.reasonCode,
    postActivationState: verification.state
  }
}
