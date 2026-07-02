import { createManagedIssue } from '../issues/issueFactory';
import { narrowPerspectives } from '../query/narrowingEngine';
import { applyEvidenceStageTransition } from '../evidence/evidencePath';
import type { EvidenceRecord } from '../../types/evidence';

export function runSubstrateDemo() {
  const issueResult = createManagedIssue({
    matterId: 'divorce_case_primary',
    title: 'Organize bar complaint packet against prior counsel',
    summary: 'Need timeline, engagement letter, invoices, communications, and proof of attempted resolution.',
    nextAction: 'Collect strongest provable records and build one-page timeline.',
    linkedRecordIds: ['rec_001', 'rec_002'],
  });

  const queryResult = narrowPerspectives({
    query: 'How do I build a bar complaint packet with the strongest proof first?',
    matterId: 'divorce_case_primary',
  });

  const evidence: EvidenceRecord = {
    id: 'ev_001',
    matterId: 'divorce_case_primary',
    sourceRecordId: 'rec_001',
    title: 'Consultation fee email',
    summary: 'Email confirming consultation fee would not be waived.',
    evidenceReadiness: 'ready_for_verification',
    evidencePathStage: 'verification_queue',
    custodyState: 'verification_queue',
    authenticityFixed: false,
    sealedAt: null,
    whyItMatters: 'Supports early warning-sign timeline and counsel conduct review.',
    linkedIssueIds: [issueResult.issue.id],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sealedEvidence = applyEvidenceStageTransition(evidence, 'soulmark_sealed_artifact');

  return {
    issueResult,
    queryResult,
    sealedEvidence,
  };
}
