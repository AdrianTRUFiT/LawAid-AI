import {
  ContinuityDecision,
  HumanComputerEntrySignal,
  RateContinuityStage
} from './continuityContracts';
import {
  evaluateContinuityConditions,
  getFailedConditions,
  getPassedConditions
} from './continuityConditions';

const DOCTRINE =
  'Attention may open the door, but only structured intent, trusted clarity, verified authorship, and authorized consequence may move through it.';

function firstFailedStage(signal: HumanComputerEntrySignal): RateContinuityStage {
  if (!signal.attentionCaptured) return 'market_entry';
  if (!signal.structuredIntent) return 'recruit';
  if (!signal.clarityStatement) return 'acquire';
  if (!signal.soulMarkId || !signal.authorshipVerified) return 'authorship_verification';
  if (!signal.humanApproved || !signal.artifactType) return 'authority_boundary';
  return 'consequence_ready';
}

function statusFromFirstFailedStage(stage: RateContinuityStage): ContinuityDecision['status'] {
  if (stage === 'acquire') return 'needs_clarity';
  if (stage === 'authorship_verification') return 'needs_authorship';
  if (stage === 'authority_boundary') return 'needs_authority';
  return 'blocked';
}

export function evaluateHumanComputerContinuity(signal: HumanComputerEntrySignal): ContinuityDecision {
  const results = evaluateContinuityConditions(signal);
  const failedConditions = getFailedConditions(results);
  const passedConditions = getPassedConditions(results);
  const currentStage = firstFailedStage(signal);

  if (failedConditions.length === 0) {
    return {
      status: 'open',
      movementAllowed: true,
      currentStage: 'consequence_ready',
      nextStage: 'consequence_ready',
      passedConditions,
      failedConditions,
      reasons: ['All continuity conditions are satisfied. Consequence may proceed only through downstream artifact law.'],
      doctrine: DOCTRINE
    };
  }

  const firstFailureOnly = results.find(result => !result.passed);

  return {
    status: statusFromFirstFailedStage(currentStage),
    movementAllowed: false,
    currentStage,
    passedConditions,
    failedConditions,
    reasons: firstFailureOnly
      ? [firstFailureOnly.reason]
      : results.filter(result => !result.passed).map(result => result.reason),
    doctrine: DOCTRINE
  };
}
