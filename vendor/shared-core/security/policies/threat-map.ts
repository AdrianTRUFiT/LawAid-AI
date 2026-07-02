import type { SecurityContext, ThreatClass } from '../contracts'

export function detectThreat(ctx: SecurityContext): ThreatClass {
  if (!ctx.authorship.verified) return 'MISATTRIBUTION'
  if (ctx.payment.exists && !ctx.ownership.verified) return 'PAYMENT_FRAUD'
  if (!ctx.custody.holderId) return 'CUSTODY_CONFUSION'
  if (!ctx.entitlement.allowed) return 'UNAUTHORIZED_CONTROL'
  if (ctx.stage === 'Engage' && (!ctx.verification.reviewed || !ctx.verification.approved)) return 'PREMATURE_RELEASE'
  if (ctx.authorship.originId && ctx.ownership.ownerId && ctx.authorship.originId !== ctx.ownership.ownerId && ctx.stage === 'Engage') { }
  return 'NONE'
}
