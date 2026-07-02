import { broadcastSecurityEvent } from './broadcast'

export function recordCommandCenterEvent(evt: {
  eventId: string
  operator?: string
  context?: string
  reason?: string
  decision?: string
  stage?: 'Recruit' | 'Acquire' | 'Transact' | 'Engage'
  threat?: string
}) {
  broadcastSecurityEvent({
    artifactId: evt.eventId,
    artifactType: 'CapturedSignal',
    stage: evt.stage ?? 'Recruit',
    decision: evt.decision ?? 'COMMAND_CENTER_EVENT',
    threat: evt.threat ?? 'NONE',
    reason: evt.reason ?? 'COMMAND_CENTER_ACTIVITY',
    enforcement: 'RECORDED',
    operator: evt.operator,
    context: evt.context
  })
}
