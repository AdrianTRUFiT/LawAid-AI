import type { SecurityContext } from '../contracts'
import { evaluateWithThreat } from './evaluate-with-threat'
import { writeSecurityLog } from './security-log'
import { routeFallback } from '../fallback/routing'

export type EnforcementResult = {
  status: 'EXECUTED' | 'BLOCKED' | 'ESCALATED'
  action: 'PROCEED' | 'QUARANTINE' | 'REVIEW_QUEUE' | 'SAFE_HOLD'
  reason: string
  threat: string
}

export function enforceSecurity(ctx: SecurityContext): EnforcementResult {
  const result = evaluateWithThreat(ctx)

  let response: EnforcementResult

  if (result.action === 'REFUSE') {
    const fallbackAction = result.fallback === 'SAFE_HOLD' ? 'SAFE_HOLD' : 'QUARANTINE'
    response = {
      status: 'BLOCKED',
      action: fallbackAction,
      reason: result.reason,
      threat: result.threat
    }

    if (result.fallback !== 'NONE') {
      routeFallback(result.fallback as 'QUARANTINE' | 'REVIEW_QUEUE' | 'SAFE_HOLD', {
        ...ctx,
        decision: result
      })
    }
  } else if (result.action === 'ESCALATE') {
    response = {
      status: 'ESCALATED',
      action: 'REVIEW_QUEUE',
      reason: result.reason,
      threat: result.threat
    }

    routeFallback('REVIEW_QUEUE', {
      ...ctx,
      decision: result
    })
  } else {
    response = {
      status: 'EXECUTED',
      action: 'PROCEED',
      reason: result.reason,
      threat: result.threat
    }
  }

  writeSecurityLog({
    artifactId: ctx.artifactId,
    artifactType: ctx.artifactType,
    stage: ctx.stage,
    decision: result.action,
    reason: result.reason,
    fallback: result.fallback,
    threat: result.threat,
    enforcement: response.status
  })

  return response
}
