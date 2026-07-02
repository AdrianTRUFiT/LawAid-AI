import { evaluatePostActivationRouting } from './postActivationRoutingGate'
import type { PostActivationInput } from '../post-activation/postActivationContracts'

export type DistrictRouteCandidate = {
  district: 'LawAidAI' | 'TravelFlow' | 'GenericDistrict'
  liveRecordId: string
  packetId: string
}

export type RoutedPostActivationResult = {
  routed: boolean
  routingState:
    | 'ROUTE_CONTINUE'
    | 'ROUTE_HOLD'
    | 'ROUTE_REFUSE'
    | 'ROUTE_BLOCK_PROPAGATION'
  reasonCode: string
  candidate: DistrictRouteCandidate | null
}

export function routeLiveRecordWithPostActivation(
  input: PostActivationInput,
  candidate: DistrictRouteCandidate
): RoutedPostActivationResult {
  const gate = evaluatePostActivationRouting(input)

  if (gate.routingState === 'ROUTE_CONTINUE') {
    return {
      routed: true,
      routingState: gate.routingState,
      reasonCode: gate.reasonCode,
      candidate
    }
  }

  return {
    routed: false,
    routingState: gate.routingState,
    reasonCode: gate.reasonCode,
    candidate: null
  }
}
