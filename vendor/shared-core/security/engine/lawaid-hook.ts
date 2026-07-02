import { enforceSecurityWrite } from './enforced-write'

export function recordLawAidEvent(input: {
  recordId: string
  source: string
  context?: string
  reason: string
}) {
  enforceSecurityWrite({
    artifactId: input.recordId,
    artifactType: 'LiveSystemRecord',
    stage: 'Engage',
    decision: 'LAW_AID_EVENT',
    reason: input.reason,
    threat: 'NONE',
    enforcement: 'EXECUTED',
    action: 'RECORDED',
    source: input.source,
    context: input.context
  })
}
