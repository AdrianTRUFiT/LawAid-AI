import {
  ContinuityCondition,
  ContinuityConditionResult,
  HumanComputerEntrySignal
} from './continuityContracts';

export function evaluateContinuityConditions(signal: HumanComputerEntrySignal): ContinuityConditionResult[] {
  const results: ContinuityConditionResult[] = [];

  results.push({
    condition: 'attention_captured',
    passed: signal.attentionCaptured === true,
    stage: 'market_entry',
    reason: signal.attentionCaptured
      ? 'Attention has opened the entry condition.'
      : 'Attention has not been captured.'
  });

  results.push({
    condition: 'intent_structured',
    passed: !!signal.structuredIntent && signal.structuredIntent.trim().length > 0,
    stage: 'recruit',
    reason: signal.structuredIntent
      ? 'DICE-adjacent structured intent exists.'
      : 'Signal has not yet been structured into intent.'
  });

  results.push({
    condition: 'clarity_trusted',
    passed: !!signal.clarityStatement && signal.clarityStatement.trim().length > 0,
    stage: 'acquire',
    reason: signal.clarityStatement
      ? 'AIOP-adjacent trusted clarity exists.'
      : 'Trusted clarity has not yet been established.'
  });

  results.push({
    condition: 'authorship_verified',
    passed: !!signal.soulMarkId && signal.authorshipVerified === true,
    stage: 'authorship_verification',
    reason: signal.soulMarkId && signal.authorshipVerified
      ? 'SoulMark? authorship/provenance verification exists.'
      : 'SoulMark? authorship/provenance verification is missing.'
  });

  results.push({
    condition: 'authority_granted',
    passed: signal.humanApproved === true && !!signal.artifactType,
    stage: 'authority_boundary',
    reason: signal.humanApproved && signal.artifactType
      ? 'Authority condition exists through human approval and artifact presence.'
      : 'Authority condition is missing human approval or required artifact.'
  });

  return results;
}

export function getFailedConditions(results: ContinuityConditionResult[]): ContinuityCondition[] {
  return results.filter(result => !result.passed).map(result => result.condition);
}

export function getPassedConditions(results: ContinuityConditionResult[]): ContinuityCondition[] {
  return results.filter(result => result.passed).map(result => result.condition);
}
