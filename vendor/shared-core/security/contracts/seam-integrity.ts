export type SimRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'IRREVERSIBLE'

export type SimDecision =
  | 'PROCEED'
  | 'PROCEED_REDUCED_TRUST'
  | 'ESCALATE'
  | 'QUARANTINE'
  | 'TRAP'
  | 'REFUSE'
  | 'SURFACE_ANOMALY'
  | 'PRESERVE_EVIDENCE'
  | 'MARK_CONTINUITY_RISK'

export type SimReason =
  | 'SEAM_COHERENT'
  | 'CROSS_CONSISTENCY_MISMATCH'
  | 'SEQUENCE_INVALID'
  | 'TIMING_WINDOW_MISMATCH'
  | 'SUBSTITUTION_RISK'
  | 'PIGGYBACK_RISK'
  | 'CONTINUITY_MISMATCH'
  | 'CONSEQUENCE_GATE_MISMATCH'
  | 'DECOY_SINK_PATTERN'
  | 'PRESSURE_DEGRADATION_RISK'
  | 'LINEAGE_REFERENCE_MISMATCH'

export type SeamIntegrityContext = {
  artifactId: string
  actorId: string | null
  artifactType: string
  stage: string

  upstream: {
    identityVerified: boolean
    authorshipAllowed: boolean
    trustPosture: 'FULL' | 'REDUCED' | 'NONE'
    passageBound: boolean
  }

  presence: {
    sessionActive: boolean
    authorshipProofLevel: 'NONE' | 'WEAK' | 'STRONG'
    authorshipContinuity: boolean
  }

  sequence: {
    currentStep: number
    expectedStep: number
    priorArtifactId: string | null
    lineageRef: string | null
    lineageMatches: boolean
  }

  timing: {
    elapsedMs: number
    minMs: number
    maxMs: number
  }

  target: {
    intendedTarget: string
    actualTarget: string
    payloadHash: string | null
    expectedPayloadHash: string | null
  }

  continuity: {
    priorStateHash: string | null
    currentStateHash: string | null
    continuityVerified: boolean
  }

  pressure: {
    repeatedAttempts: number
    mimicPatternDetected: boolean
    decoySinkDetected: boolean
    exhaustionRisk: boolean
  }

  consequence: {
    risk: SimRisk
    irreversible: boolean
    passageScopeCount: number
    allowedScopeCount: number
  }
}

export type SeamIntegrityResult = {
  action: SimDecision
  reason: SimReason
  severity: 'INFO' | 'WARN' | 'HIGH'
  fallback: 'NONE' | 'SAFE_HOLD' | 'REVIEW_QUEUE' | 'QUARANTINE' | 'TRAP'
}
