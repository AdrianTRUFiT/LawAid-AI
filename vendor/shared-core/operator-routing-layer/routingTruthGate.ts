export type RoutingRuntimeContext = {
  runtimeClosureState: 'VALID' | 'DEGRADED' | 'INCONSISTENT' | 'SUPERSEDED'
  deterministicReplayStable: boolean
  hilStateTags: string[]
  degradedSupportCount: number
  overlapPairCount: number
  reasons: string[]
  isStale: boolean
}

export type RoutingDecisionPacket = {
  triggerClassification: string
  branchResult: 'CONTINUE' | 'HOLD' | 'STOP'
  nextAction: string
  decisionRecordId: string
  state: 'pending' | 'deferred' | 'final'
}

export type PostActivationVerification = {
  replayDetected: boolean
  isSuperseded: boolean
}

export type RoutingResult =
  | 'ROUTING_ALLOW'
  | 'ROUTING_HOLD'
  | 'ROUTING_REFUSE'
  | 'ROUTING_BLOCK_PROPAGATION'

export function routingTruthGate(
  runtime: RoutingRuntimeContext,
  decision: RoutingDecisionPacket,
  post: PostActivationVerification
): { result: RoutingResult; reason: string } {
  if (runtime.isStale) {
    return { result: 'ROUTING_REFUSE', reason: 'STALE_RUNTIME_CONTEXT' }
  }

  if (post.replayDetected || !runtime.deterministicReplayStable) {
    return { result: 'ROUTING_REFUSE', reason: 'REPLAY_ATTEMPT' }
  }

  if (post.isSuperseded || runtime.runtimeClosureState === 'SUPERSEDED') {
    return { result: 'ROUTING_BLOCK_PROPAGATION', reason: 'SUPERSEDED_RECORD' }
  }

  if (runtime.runtimeClosureState === 'INCONSISTENT') {
    return { result: 'ROUTING_REFUSE', reason: 'INCONSISTENT_STATE' }
  }

  if (runtime.runtimeClosureState === 'DEGRADED') {
    return { result: 'ROUTING_HOLD', reason: 'DEGRADED_RUNTIME' }
  }

  if (runtime.runtimeClosureState === 'VALID') {
    return { result: 'ROUTING_ALLOW', reason: 'ALL_CONDITIONS_VALID' }
  }

  return { result: 'ROUTING_REFUSE', reason: 'UNKNOWN_STATE' }
}
