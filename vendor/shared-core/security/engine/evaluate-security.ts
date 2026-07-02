import type { SecurityContext, SecurityDecision } from '../contracts'
import { getStagePolicy } from '../policies/stage-policies'

export function evaluateSecurity(ctx: SecurityContext): SecurityDecision {
  const policy = getStagePolicy(ctx.stage)

  if (policy.requireVerifiedAuthorship && !ctx.authorship.verified) {
    return { action: 'REFUSE', reason: 'UNVERIFIED_AUTHORSHIP', fallback: 'QUARANTINE' }
  }

  if (!ctx.custody.holderId) {
    return { action: 'REFUSE', reason: 'INVALID_CUSTODY', fallback: 'QUARANTINE' }
  }

  if (ctx.payment.exists && !ctx.ownership.verified) {
    return { action: 'REFUSE', reason: 'PAYMENT_NOT_AUTHORITY', fallback: 'SAFE_HOLD' }
  }

  if (policy.requireVerifiedOwnership && !ctx.ownership.verified) {
    return { action: 'REFUSE', reason: 'OWNERSHIP_NOT_VERIFIED', fallback: 'SAFE_HOLD' }
  }

  if (!ctx.entitlement.allowed) {
    return { action: 'REFUSE', reason: 'INVALID_ENTITLEMENT', fallback: 'QUARANTINE' }
  }

  if (policy.requireReviewed && !ctx.verification.reviewed) {
    return { action: 'REFUSE', reason: 'UNVERIFIED_STATE', fallback: 'REVIEW_QUEUE' }
  }

  if (policy.requireApproved && !ctx.verification.approved) {
    return { action: 'REFUSE', reason: 'STAGE_VIOLATION', fallback: 'REVIEW_QUEUE' }
  }

  return { action: 'ALLOW', reason: 'VERIFIED_PATH', fallback: 'NONE' }
}
