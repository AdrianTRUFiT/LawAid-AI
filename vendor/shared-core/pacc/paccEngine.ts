import crypto from 'crypto';
import { PaccDecision, PaccRiskLevel, PaccSignal, PaccState } from './paccContracts';

function id(input: string) {
  return 'PACC-' + crypto.createHash('sha256').update(input).digest('hex').slice(0, 12);
}

function risk(signal: PaccSignal): PaccRiskLevel {
  if (signal.verifiedError) return 'VERIFIED_ERROR';

  const flags = [
    signal.driftDetected,
    signal.missingProof,
    signal.stageSkipping,
    signal.abnormalPattern,
    signal.consequenceBearing && !signal.userCustodyPresent,
    signal.parentCustodyRequired && !signal.parentCustodyPresent
  ].filter(Boolean).length;

  if (flags >= 3) return 'HIGH';
  if (flags === 2) return 'MEDIUM';
  if (flags === 1) return 'LOW';
  return 'NONE';
}

function stateFor(signal: PaccSignal, riskLevel: PaccRiskLevel): PaccState {
  if (riskLevel === 'VERIFIED_ERROR') return 'LOCK';
  if (signal.consequenceBearing && signal.evidenceCount < 2) return 'REVIEW';
  if (riskLevel === 'HIGH') return 'REVIEW';
  if (riskLevel === 'MEDIUM') return 'PAUSE';
  if (riskLevel === 'LOW') return 'NUDGE';
  return 'ALLOW';
}

export function runPaccCheck(signal: PaccSignal): PaccDecision {
  const riskLevel = risk(signal);
  const state = stateFor(signal, riskLevel);

  const allowed = state === 'ALLOW' || state === 'NUDGE';
  const consequenceAllowed = state === 'LOCK' && signal.verifiedError === true;

  const reason =
    state === 'ALLOW' ? 'AUTOMATION_WITHIN_SAFE_LIMITS' :
    state === 'NUDGE' ? 'EARLY_RISK_SIGNAL_DETECTED_NO_CONSEQUENCE' :
    state === 'PAUSE' ? 'AUTOMATION_PAUSED_FOR_VERIFICATION_NO_PUNISHMENT' :
    state === 'REVIEW' ? 'HUMAN_OR_PARENT_REVIEW_REQUIRED_BEFORE_CONSEQUENCE' :
    'VERIFIED_ERROR_LOCKED';

  const requiredNextStep =
    state === 'ALLOW' ? 'CONTINUE' :
    state === 'NUDGE' ? 'WARN_AND_CONTINUE_WITH_MONITORING' :
    state === 'PAUSE' ? 'PAUSE_AND_COLLECT_PROOF' :
    state === 'REVIEW' ? 'REQUIRE_AUTHORIZED_REVIEW' :
    'APPLY_LOCK_AND_RECORD_VERIFIED_ERROR';

  return {
    decisionId: id(JSON.stringify(signal)),
    state,
    riskLevel,
    allowed,
    consequenceAllowed,
    reason,
    requiredNextStep,
    createdAt: new Date().toISOString(),
    signal
  };
}
