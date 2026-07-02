export type EvidenceReadiness =
  | 'not_applicable'
  | 'possible'
  | 'candidate'
  | 'review_required'
  | 'ready_for_verification'
  | 'sealed';

export type EvidencePathStage =
  | 'captured_record'
  | 'reviewed_record'
  | 'evidence_candidate'
  | 'verification_queue'
  | 'soulmark_sealed_artifact'
  | 'evidence_custody';

export interface EvidenceRecord {
  id: string;
  matterId: string;
  sourceRecordId: string;
  title: string;
  summary: string;
  evidenceReadiness: EvidenceReadiness;
  evidencePathStage: EvidencePathStage;
  custodyState: 'active' | 'under_review' | 'verification_queue' | 'sealed' | 'archived';
  authenticityFixed: boolean;
  sealedAt: string | null;
  whyItMatters: string;
  linkedIssueIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceTransitionResult {
  evidenceId: string;
  from: EvidencePathStage;
  to: EvidencePathStage;
  allowed: boolean;
  reasons: string[];
}
