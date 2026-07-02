import type { EvidencePathStage, EvidenceRecord, EvidenceTransitionResult } from '../../types/evidence';

const ALLOWED_TRANSITIONS: Record<EvidencePathStage, EvidencePathStage[]> = {
  captured_record: ['reviewed_record'],
  reviewed_record: ['evidence_candidate'],
  evidence_candidate: ['verification_queue'],
  verification_queue: ['soulmark_sealed_artifact'],
  soulmark_sealed_artifact: ['evidence_custody'],
  evidence_custody: [],
};

export function transitionEvidenceStage(
  evidence: EvidenceRecord,
  nextStage: EvidencePathStage,
): EvidenceTransitionResult {
  const allowedNext = ALLOWED_TRANSITIONS[evidence.evidencePathStage] ?? [];
  const reasons: string[] = [];

  if (!allowedNext.includes(nextStage)) {
    reasons.push(`invalid transition from ${evidence.evidencePathStage} to ${nextStage}`);
    return {
      evidenceId: evidence.id,
      from: evidence.evidencePathStage,
      to: nextStage,
      allowed: false,
      reasons,
    };
  }

  if (evidence.evidencePathStage === 'verification_queue' && nextStage === 'soulmark_sealed_artifact') {
    if (evidence.evidenceReadiness !== 'ready_for_verification') {
      reasons.push('evidence is not ready for verification and cannot be sealed');
      return {
        evidenceId: evidence.id,
        from: evidence.evidencePathStage,
        to: nextStage,
        allowed: false,
        reasons,
      };
    }
  }

  reasons.push(`transition allowed from ${evidence.evidencePathStage} to ${nextStage}`);

  return {
    evidenceId: evidence.id,
    from: evidence.evidencePathStage,
    to: nextStage,
    allowed: true,
    reasons,
  };
}

export function applyEvidenceStageTransition(
  evidence: EvidenceRecord,
  nextStage: EvidencePathStage,
): EvidenceRecord {
  const result = transitionEvidenceStage(evidence, nextStage);

  if (!result.allowed) {
    throw new Error(result.reasons.join(' | '));
  }

  const now = new Date().toISOString();

  return {
    ...evidence,
    evidencePathStage: nextStage,
    evidenceReadiness:
      nextStage === 'evidence_candidate'
        ? 'candidate'
        : nextStage === 'verification_queue'
          ? 'ready_for_verification'
          : nextStage === 'soulmark_sealed_artifact' || nextStage === 'evidence_custody'
            ? 'sealed'
            : evidence.evidenceReadiness,
    custodyState:
      nextStage === 'verification_queue'
        ? 'verification_queue'
        : nextStage === 'soulmark_sealed_artifact' || nextStage === 'evidence_custody'
          ? 'sealed'
          : evidence.custodyState,
    authenticityFixed: nextStage === 'soulmark_sealed_artifact' || nextStage === 'evidence_custody',
    sealedAt:
      nextStage === 'soulmark_sealed_artifact' || nextStage === 'evidence_custody'
        ? now
        : evidence.sealedAt,
    updatedAt: now,
  };
}