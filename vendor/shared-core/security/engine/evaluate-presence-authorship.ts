import type {
  PresenceAuthorshipContext,
  PresenceAuthorshipDecision
} from '../contracts/presence-authorship'

export function evaluatePresenceAuthorship(
  ctx: PresenceAuthorshipContext
): PresenceAuthorshipDecision {
  if (!ctx.presence.sessionOpen || ctx.presence.level === 'NONE') {
    return {
      action: 'REFUSE',
      reason: 'NO_PRESENCE',
      fallback: 'SAFE_HOLD'
    }
  }

  const hasFullAuthorship =
    ctx.authorship.actorVerified &&
    ctx.authorship.actVerified &&
    ctx.authorship.payloadVerified &&
    ctx.authorship.continuityVerified

  const hasPresenceOnly =
    ctx.presence.sessionOpen &&
    ctx.presence.level !== 'NONE' &&
    !ctx.authorship.actorVerified &&
    !ctx.authorship.actVerified &&
    !ctx.authorship.payloadVerified

  if (hasPresenceOnly) {
    return {
      action: 'ESCALATE',
      reason: 'PRESENCE_ONLY',
      fallback: 'CHALLENGE'
    }
  }

  if (ctx.consequence.irreversible && !hasFullAuthorship) {
    return {
      action: 'REFUSE',
      reason: 'IRREVERSIBLE_REQUIRES_FULL_AUTHORSHIP',
      fallback: 'SAFE_HOLD'
    }
  }

  if (
    (ctx.consequence.risk === 'HIGH' || ctx.consequence.risk === 'IRREVERSIBLE') &&
    !hasFullAuthorship
  ) {
    return {
      action: 'ESCALATE',
      reason: 'HIGH_RISK_REQUIRES_FULL_AUTHORSHIP',
      fallback: 'REVIEW_QUEUE'
    }
  }

  const hasMinimumAuthorship =
    ctx.authorship.actorVerified &&
    ctx.authorship.actVerified &&
    ctx.authorship.continuityVerified

  if (!hasMinimumAuthorship) {
    return {
      action: 'ESCALATE',
      reason: 'INSUFFICIENT_AUTHORSHIP',
      fallback: 'CHALLENGE'
    }
  }

  return {
    action: 'ALLOW',
    reason: 'AUTHORSHIP_VERIFIED',
    fallback: 'NONE'
  }
}
