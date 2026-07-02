export type SecurityStage = 'Recruit' | 'Acquire' | 'Transact' | 'Engage'
export type SecurityArtifactType =
  | 'CapturedSignal'
  | 'VerifiedOpportunity'
  | 'ActivatedTransactionState'
  | 'LiveSystemRecord'
  | 'SystemEvent'

export type CustodyType = 'temporary' | 'storage' | 'processing'
export type EntitlementBasis = 'contract' | 'verification' | 'none'

export type SecurityContext = {
  artifactId: string
  artifactType: SecurityArtifactType
  stage: SecurityStage

  authorship: {
    originId: string | null
    verified: boolean
  }

  ownership: {
    ownerId: string | null
    verified: boolean
  }

  custody: {
    holderId: string | null
    type: CustodyType
  }

  entitlement: {
    allowed: boolean
    basis: EntitlementBasis
  }

  payment: {
    exists: boolean
    amount?: number
    linkedToOwnership: false
  }

  verification: {
    reviewed: boolean
    approved: boolean
  }
}
