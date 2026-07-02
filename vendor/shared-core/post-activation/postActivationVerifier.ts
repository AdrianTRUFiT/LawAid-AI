import type {
  PostActivationInput,
  PostActivationResult
} from './postActivationContracts'

function isStale(input: PostActivationInput): boolean {
  const created = new Date(input.liveSystemRecord.createdAtIso).getTime()
  const now = new Date(input.timestamp).getTime()
  return now - created > input.maxRecordAgeMs
}

function hasReplay(input: PostActivationInput): boolean {
  if (!input.expectedReplayKey) return false
  return input.replayKey !== input.expectedReplayKey
}

function isSuperseded(input: PostActivationInput): boolean {
  return typeof input.liveSystemRecord.supersededByLiveRecordId === 'string' &&
    input.liveSystemRecord.supersededByLiveRecordId.length > 0
}

function hasContextMismatch(input: PostActivationInput): boolean {
  if (input.expectedContextId && input.liveSystemRecord.contextId !== input.expectedContextId) {
    return true
  }

  return input.liveSystemRecord.contextId !== input.activatedTransactionState.contextId
}

function hasActivationMismatch(input: PostActivationInput): boolean {
  if (input.expectedActivationId && input.liveSystemRecord.activationId !== input.expectedActivationId) {
    return true
  }

  return input.liveSystemRecord.activationId !== input.activatedTransactionState.activationId
}

function hasHashMismatch(input: PostActivationInput): boolean {
  return input.liveSystemRecord.sourceArtifactHash !== input.activatedTransactionState.artifactHash
}

function governanceInvalid(input: PostActivationInput): boolean {
  return !input.governanceRecord.certified || input.governanceRecord.packetState !== 'I_FACT_VALID'
}

function runtimeInvalid(input: PostActivationInput): boolean {
  return input.runtimeState.runtimeTruthState === 'RUNTIME_REFUSED' ||
    input.runtimeState.latestClosureState === 'REFUSED'
}

export function verifyPostActivation(input: PostActivationInput): PostActivationResult {
  if (governanceInvalid(input)) {
    return {
      state: 'POST_ACTIVATION_INCONSISTENT',
      decision: 'REFUSE',
      enforcementClass: 'HARD_REFUSAL',
      reasonCode: 'GOVERNANCE_INVALID',
      propagationAllowed: false,
      explanation: 'Governance record is not certified valid for continued post-activation trust.'
    }
  }

  if (runtimeInvalid(input)) {
    return {
      state: 'POST_ACTIVATION_INCONSISTENT',
      decision: 'REFUSE',
      enforcementClass: 'HARD_REFUSAL',
      reasonCode: 'RUNTIME_INVALID',
      propagationAllowed: false,
      explanation: 'Runtime truth no longer supports the accepted downstream state.'
    }
  }

  if (hasReplay(input)) {
    return {
      state: 'POST_ACTIVATION_INCONSISTENT',
      decision: 'REFUSE',
      enforcementClass: 'HARD_REFUSAL',
      reasonCode: 'REPLAY_ATTEMPT',
      propagationAllowed: false,
      explanation: 'Replay key mismatch indicates replay or invalid reuse after activation.'
    }
  }

  if (hasActivationMismatch(input) || hasContextMismatch(input) || hasHashMismatch(input)) {
    return {
      state: 'POST_ACTIVATION_INCONSISTENT',
      decision: 'REFUSE',
      enforcementClass: 'HARD_REFUSAL',
      reasonCode: 'DOWNSTREAM_CONFLICT',
      propagationAllowed: false,
      explanation: 'Live record no longer matches activation truth, context, or source artifact.'
    }
  }

  if (isSuperseded(input)) {
    return {
      state: 'POST_ACTIVATION_SUPERSEDED',
      decision: 'BLOCK_PROPAGATION',
      enforcementClass: 'PROPAGATION_BLOCK',
      reasonCode: 'SUPERSEDED_RECORD',
      propagationAllowed: false,
      explanation: 'Live record has been superseded and must not continue propagating.'
    }
  }

  if (isStale(input)) {
    return {
      state: 'POST_ACTIVATION_DEGRADED',
      decision: 'HOLD',
      enforcementClass: 'SAFE_HOLD',
      reasonCode: 'STALE_POST_ACTIVATION_RECORD',
      propagationAllowed: false,
      explanation: 'Accepted record is stale relative to the allowed post-activation continuity window.'
    }
  }

  return {
    state: 'POST_ACTIVATION_VALID',
    decision: 'ALLOW',
    enforcementClass: 'CONTINUE',
    reasonCode: 'POST_ACTIVATION_OK',
    propagationAllowed: true,
    explanation: 'Post-activation record remains consistent with activation, governance, and runtime truth.'
  }
}
