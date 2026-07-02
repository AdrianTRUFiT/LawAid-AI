import type { SecurityContext, ThreatEvaluation } from '../contracts'
import { evaluateSecurity } from './evaluate-security'
import { detectThreat } from '../policies/threat-map'

export function evaluateWithThreat(ctx: SecurityContext): ThreatEvaluation {
  const base = evaluateSecurity(ctx)
  const threat = detectThreat(ctx)

  if (threat === 'IMPERSONATION' && base.action === 'ALLOW') {
    return {
      action: 'ESCALATE',
      reason: 'POTENTIAL_IMPERSONATION',
      fallback: 'REVIEW_QUEUE',
      threat
    }
  }

  return {
    ...base,
    threat
  }
}
