export type CustodyState =
  | 'active'
  | 'staged'
  | 'under_review'
  | 'verification_queue'
  | 'sealed'
  | 'archived'
  | 'dormant'
  | 'deleted';

export type MemoryLayer =
  | 'capture'
  | 'intake_holding_tank'
  | 'working_holding_tank'
  | 'thinkbaseai'
  | 'verification_queue'
  | 'soulmark_transition'
  | 'soulvaultai';

export type RetentionDecision =
  | 'keep_active'
  | 'archive'
  | 'compress'
  | 'detach'
  | 'mark_dormant'
  | 'delete'
  | 'refuse';

export interface CustodyRecord {
  id: string;
  matterId: string;
  objectType: 'record' | 'issue' | 'event' | 'task' | 'expense' | 'evidence';
  objectId: string;
  memoryLayer: MemoryLayer;
  custodyState: CustodyState;
  dependencyIds: string[];
  explanation: string;
  deletable: boolean;
  archivable: boolean;
  sealed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HoldingTankDecisionResult {
  objectId: string;
  allowed: boolean;
  decision: RetentionDecision;
  reasons: string[];
  resultingCustodyState: CustodyState;
}