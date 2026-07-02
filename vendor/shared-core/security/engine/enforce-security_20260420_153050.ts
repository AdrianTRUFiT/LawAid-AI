import { evaluateWithThreat } from './evaluate-with-threat'
import { writeSecurityLog } from './security-log'

export type EnforcementResult = {
  status: 'EXECUTED' | 'BLOCKED' | 'ESCALATED'
  action: string
  reason: string
  threat: string
}

export function enforceSecurity(ctx: any): EnforcementResult {
  const result = evaluateWithThreat(ctx)

  let response: EnforcementResult

  if (result.action === 'REFUSE') {
    response = {
      status: 'BLOCKED',
      action: 'QUARANTINE',
      reason: result.reason,
      threat: result.threat
    }
  } else if (result.action === 'ESCALATE') {
    response = {
      status: 'ESCALATED',
      action: 'REVIEW_QUEUE',
      reason: result.reason,
      threat: result.threat
    }
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
    threat: result.threat,
    reason: result.reason,
    enforcement: response.status
  })

  return response
}
