export type ClosureState = 'CLEARED' | 'CONSTRAINED' | 'HELD' | 'REFUSED'

export type OverrideType =
  | 'NONE'
  | 'ATTESTATION_REQUIRED'
  | 'MANUAL_REVIEW_ONLY'
  | 'HIL_OVERRIDE'

export type FallbackRoute =
  | 'NONE'
  | 'REVIEW_QUEUE'
  | 'SAFE_HOLD'
  | 'RIGHTS_REVIEW'
  | 'BYPASS_INVESTIGATION'

export type ClosureInputs = {
  closureId: string
  runtimeReady: boolean
  governanceReady: boolean
  paymentConfirmed: boolean
  authorityValid: boolean
  custodyValid: boolean
  ownershipValid: boolean
  entitlementValid: boolean
  releaseValid: boolean
  bypassDetected: boolean
  attestationPresent: boolean
}

export type EnforcedClosureState = {
  enforcedClosureState: ClosureState
  enforcementReasons: string[]
  overrideApplied: boolean
  overrideType: OverrideType
  fallbackOrEscalationRoute: FallbackRoute
  attestationRequired: boolean
  finalConnectionHonored: boolean
}
