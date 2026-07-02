export type PresenceLevel =
  | 'NONE'
  | 'READY'
  | 'ACTIVE'

export type AuthorshipProofLevel =
  | 'NONE'
  | 'CONTEXT_ONLY'
  | 'ACTOR_ONLY'
  | 'ACTOR_AND_ACT'
  | 'FULL'

export type ConsequenceRisk =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'IRREVERSIBLE'

export type PresenceAuthorshipContext = {
  artifactId: string
  actorId: string | null

  presence: {
    level: PresenceLevel
    sessionOpen: boolean
    deviceBound: boolean
    trustedContext: boolean
  }

  authorship: {
    actorVerified: boolean
    actVerified: boolean
    payloadVerified: boolean
    continuityVerified: boolean
    proofLevel: AuthorshipProofLevel
  }

  consequence: {
    risk: ConsequenceRisk
    target: string
    irreversible: boolean
  }
}

export type PresenceAuthorshipDecision = {
  action: 'ALLOW' | 'REFUSE' | 'ESCALATE'
  reason:
    | 'NO_PRESENCE'
    | 'PRESENCE_ONLY'
    | 'INSUFFICIENT_AUTHORSHIP'
    | 'HIGH_RISK_REQUIRES_FULL_AUTHORSHIP'
    | 'IRREVERSIBLE_REQUIRES_FULL_AUTHORSHIP'
    | 'AUTHORSHIP_VERIFIED'
  fallback: 'NONE' | 'SAFE_HOLD' | 'REVIEW_QUEUE' | 'CHALLENGE'
}
