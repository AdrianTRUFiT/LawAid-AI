export type PostActivationState =
  | 'POST_ACTIVATION_VALID'
  | 'POST_ACTIVATION_DEGRADED'
  | 'POST_ACTIVATION_SUPERSEDED'
  | 'POST_ACTIVATION_INCONSISTENT'

export type PostActivationDecision =
  | 'ALLOW'
  | 'HOLD'
  | 'REFUSE'
  | 'BLOCK_PROPAGATION'

export type PostActivationEnforcementClass =
  | 'CONTINUE'
  | 'SAFE_HOLD'
  | 'HARD_REFUSAL'
  | 'PROPAGATION_BLOCK'

export type ActivatedTransactionStateEnvelope = {
  activationId: string
  transactionId: string
  artifactHash: string
  contextId: string
  createdAtIso: string
}

export type CertifiedGovernanceRecord = {
  recordId: string
  packetId: string
  certified: boolean
  packetState: 'I_FACT_VALID' | 'I_FACT_FAILED_MUTATION' | 'I_FACT_FAILED_INCOMPLETE' | 'I_FACT_UNCERTIFIED'
  authoredCoreHash: string
  invariantSetHash: string
}

export type RuntimeStateEnvelope = {
  runtimeEnvelopeId: string
  runtimeTruthState: 'RUNTIME_READY' | 'RUNTIME_DEGRADED' | 'RUNTIME_HELD' | 'RUNTIME_REFUSED'
  latestClosureState: 'CLEARED' | 'CONSTRAINED' | 'HELD' | 'REFUSED'
}

export type LiveSystemRecordEnvelope = {
  liveRecordId: string
  activationId: string
  transactionId: string
  sourceArtifactHash: string
  contextId: string
  createdAtIso: string
  supersededByLiveRecordId?: string | null
  propagated?: boolean
}

export type PostActivationInput = {
  activatedTransactionState: ActivatedTransactionStateEnvelope
  governanceRecord: CertifiedGovernanceRecord
  runtimeState: RuntimeStateEnvelope
  liveSystemRecord: LiveSystemRecordEnvelope
  timestamp: string
  expectedActivationId?: string | null
  expectedContextId?: string | null
  expectedReplayKey?: string | null
  replayKey?: string | null
  maxRecordAgeMs: number
}

export type PostActivationResult = {
  state: PostActivationState
  decision: PostActivationDecision
  enforcementClass: PostActivationEnforcementClass
  reasonCode: string
  propagationAllowed: boolean
  explanation: string
}
