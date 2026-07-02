import type { SecurityContext } from '../contracts'
import { enforceSecurityWrite } from './enforced-write'

export function broadcastSecurityEvent(entry: Partial<SecurityContext> & Record<string, unknown>) {
  enforceSecurityWrite({
    artifactId: entry.artifactId ?? 'UNKNOWN_EVENT',
    artifactType: entry.artifactType ?? 'SystemEvent',
    stage: entry.stage ?? 'Recruit',
    decision: entry.decision ?? 'SYSTEM_EVENT',
    reason: entry.reason ?? 'BROADCAST',
    threat: entry.threat ?? 'NONE',
    enforcement: entry.enforcement ?? 'RECORDED',
    context: entry
  })
}
