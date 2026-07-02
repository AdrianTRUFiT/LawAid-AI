import { ClassifiedSystemPattern, ReviewPacket, RuntimeKnowledgeRegistryEntry } from './knowledgeContracts';
import { makeId } from './knowledgeUtils';

export function determineReviewStatus(pattern: ClassifiedSystemPattern) {
  if (pattern.riskClasses.includes('doctrine_mutation_risk') || pattern.riskClasses.includes('authority_gap')) {
    return 'NEEDS_REVIEW' as const;
  }

  return 'REFERENCE_ONLY' as const;
}

export function buildReviewPacket(entry: RuntimeKnowledgeRegistryEntry): ReviewPacket | null {
  if (entry.reviewStatus !== 'NEEDS_REVIEW') return null;

  return {
    packetId: makeId('KREVIEW', entry.entryId),
    entryId: entry.entryId,
    reason: 'CONTENT_MAY_AFFECT_AUTHORITY_OR_DOCTRINE',
    requestedReviewBy: entry.relevance.workspaces.filter(w => ['HARD', 'PONG', 'MARK'].includes(w)),
    doctrineMutationBlocked: true
  };
}
