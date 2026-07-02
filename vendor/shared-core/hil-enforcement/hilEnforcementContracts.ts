export type IfactPacketState =
  | 'I_FACT_VALID'
  | 'I_FACT_FAILED_MUTATION'
  | 'I_FACT_FAILED_INCOMPLETE'
  | 'I_FACT_UNCERTIFIED'

export type EnforcementCloseState =
  | 'ENFORCE_ALLOW'
  | 'ENFORCE_HOLD'
  | 'ENFORCE_REFUSE'
  | 'ENFORCE_REFUSE_MUTATION'
  | 'ENFORCE_REFUSE_UNCERTIFIED'
  | 'ENFORCE_REFUSE_INCOMPLETE'

export type RuntimeTruthState =
  | 'RUNTIME_READY'
  | 'RUNTIME_DEGRADED'
  | 'RUNTIME_HELD'
  | 'RUNTIME_REFUSED'

export type GovernanceDecisionState =
  | 'GOVERNANCE_VALID'
  | 'GOVERNANCE_HOLD'
  | 'GOVERNANCE_REFUSED'

export type RuntimeTruthEnvelope = {
  envelopeId: string
  source: 'PING'
  runtimeTruthState: RuntimeTruthState
  latestClosureState: string
  replayStabilityStatus: 'STABLE' | 'CHANGED'
  overlapPairDeltaTruth: 'UNCHANGED' | 'CHANGED'
  degradedSupportState: 'NONE' | 'BOUNDED_DEGRADED'
  newestAuditEvidenceBrief: string
}

export type GovernanceCertifiedEnvelope = {
  envelopeId: string
  source: 'PONG'
  packetState: IfactPacketState
  certified: boolean
  mutationDetected: boolean
  incompleteDetected: boolean
  governanceDecisionState: GovernanceDecisionState
  authoredCoreHash: string
  invariantSetHash: string
  certificationStatus: 'CERTIFIED' | 'UNCERTIFIED'
  reasons: string[]
}

export type HilEnforcementInput = {
  runtime: RuntimeTruthEnvelope
  governance: GovernanceCertifiedEnvelope
  protectedWriteBypassAttempted: boolean
}

export type HilEnforcementSeal = {
  runtimeHash: string
  governanceHash: string
  combinedHash: string
}

export type HilEnforcementResult = {
  enforcedCloseState: EnforcementCloseState
  enforcementReasons: string[]
  appendOnlyRecorded: boolean
  protectedWriteIntact: boolean
  finalPathClosed: boolean
}
