export type TruthLane = 'public' | 'semi_private' | 'private';
export type MemoryObjectClass =
  | 'signal'
  | 'note'
  | 'pattern'
  | 'decision'
  | 'rule'
  | 'contract'
  | 'authority'
  | 'artifact'
  | 'deprecated';

export type MemoryScope = 'local' | 'project' | 'environment' | 'ecosystem';
export type VerificationStatus =
  | 'unverified'
  | 'source_backed'
  | 'reviewed'
  | 'implementation_verified'
  | 'trusted';

export type PromotionStatus =
  | 'captured'
  | 'candidate'
  | 'accepted'
  | 'active'
  | 'superseded'
  | 'archived';

export type MemoryRelation =
  | 'extends'
  | 'corrects'
  | 'depends_on'
  | 'replaces'
  | 'supports'
  | 'contradicts'
  | 'same_topic';

export interface MemoryObject {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  content: string;
  objectClass: MemoryObjectClass;
  scope: MemoryScope;
  verification: VerificationStatus;
  promotion: PromotionStatus;
  truthLane: TruthLane;
  tags: string[];
  sourceRefs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MemoryLink {
  fromId: string;
  toId: string;
  relation: MemoryRelation;
}

export interface ContinuationPacket {
  packetId: string;
  projectId: string;
  objective: string;
  currentReality: string[];
  lockedConstraints: string[];
  activeDecisions: string[];
  nextBuildTargets: string[];
  unresolvedButTracked: string[];
  requiredContextIds: string[];
  createdAt: string;
}
