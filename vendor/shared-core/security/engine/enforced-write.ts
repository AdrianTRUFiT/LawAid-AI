import { writeSecurityLog } from './security-log'

export function enforceSecurityWrite(entry: Record<string, unknown>) {
  if (!entry.artifactId) {
    throw new Error('INVALID_SECURITY_ENTRY: artifactId required')
  }

  if (!entry.artifactType) {
    throw new Error('INVALID_SECURITY_ENTRY: artifactType required')
  }

  if (!entry.stage) {
    throw new Error('INVALID_SECURITY_ENTRY: stage required')
  }

  if (!entry.decision) {
    throw new Error('INVALID_SECURITY_ENTRY: decision required')
  }

  writeSecurityLog(entry)
}
