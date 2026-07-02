import type { PresenceAuthorshipContext } from '../contracts/presence-authorship'
import { evaluatePresenceAuthorship } from './evaluate-presence-authorship'
import { enforceSecurityWrite } from './enforced-write'

export function enforcePresenceAuthorship(ctx: PresenceAuthorshipContext) {
  const result = evaluatePresenceAuthorship(ctx)

  const status =
    result.action === 'ALLOW'
      ? 'EXECUTED'
      : result.action === 'ESCALATE'
        ? 'ESCALATED'
        : 'BLOCKED'

  enforceSecurityWrite({
    artifactId: ctx.artifactId,
    artifactType: 'PresenceAuthorshipGate',
    stage: 'Authorize',
    decision: 'PRESENCE_AUTHORSHIP_CHECK',
    reason: result.reason,
    threat: result.action === 'ALLOW' ? 'NONE' : 'AUTHORSHIP_GAP',
    enforcement: status,
    action: result.action,
    fallback: result.fallback,
    actorId: ctx.actorId,
    presenceLevel: ctx.presence.level,
    proofLevel: ctx.authorship.proofLevel,
    risk: ctx.consequence.risk,
    irreversible: ctx.consequence.irreversible,
    target: ctx.consequence.target
  })

  return result
}
