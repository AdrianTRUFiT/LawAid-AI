export type SecurityAction = 'ALLOW' | 'REFUSE' | 'ESCALATE' | 'CONTAIN'
export type SecurityFallback = 'NONE' | 'QUARANTINE' | 'REVIEW_QUEUE' | 'SAFE_HOLD'

export type SecurityReason =
  | 'VERIFIED_PATH'
  | 'UNVERIFIED_STATE'
  | 'UNVERIFIED_AUTHORSHIP'
  | 'INVALID_ENTITLEMENT'
  | 'PAYMENT_NOT_AUTHORITY'
  | 'OWNERSHIP_NOT_VERIFIED'
  | 'STAGE_VIOLATION'
  | 'INVALID_CUSTODY'
  | 'POTENTIAL_IMPERSONATION'
  | 'PRIVACY_VIOLATION'

export type SecurityDecision = {
  action: SecurityAction
  reason: SecurityReason
  fallback: SecurityFallback
}

export type ThreatClass =
  | 'NONE'
  | 'MISATTRIBUTION'
  | 'UNAUTHORIZED_CONTROL'
  | 'CUSTODY_CONFUSION'
  | 'PREMATURE_RELEASE'
  | 'PAYMENT_FRAUD'
  | 'PRIVACY_BREACH'
  | 'IMPERSONATION'
  | 'STATE_SKIPPING'

export type ThreatEvaluation = SecurityDecision & {
  threat: ThreatClass
}
