import type { ClosureDecisionEnvelope } from '../contracts/closureDecisionEnvelope'

export function renderEnforcedClosureBrief(envelope: ClosureDecisionEnvelope): string {
  const reasons = envelope.result.enforcementReasons.length > 0
    ? envelope.result.enforcementReasons.join(', ')
    : 'NONE'

  return [
    'CLOSURE=' + envelope.closureId,
    'STATE=' + envelope.result.enforcedClosureState,
    'HONORED=' + String(envelope.result.finalConnectionHonored),
    'OVERRIDE=' + String(envelope.result.overrideApplied),
    'OVERRIDE_TYPE=' + envelope.result.overrideType,
    'ROUTE=' + envelope.result.fallbackOrEscalationRoute,
    'ATTESTATION_REQUIRED=' + String(envelope.result.attestationRequired),
    'REASONS=' + reasons
  ].join(' | ')
}
