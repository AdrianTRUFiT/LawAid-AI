import { RuntimeKnowledgeRegistryEntry } from './knowledgeContracts';

export function createRuntimeReference(entry: RuntimeKnowledgeRegistryEntry) {
  if (entry.reviewStatus !== 'APPROVED_RUNTIME_REFERENCE') {
    return {
      status: 'REFUSED',
      reason: 'ENTRY_NOT_APPROVED_FOR_RUNTIME_REFERENCE',
      entryId: entry.entryId
    };
  }

  return {
    status: 'ACTIVE_RUNTIME_REFERENCE',
    entryId: entry.entryId,
    title: entry.signal.title,
    domain: entry.pattern.domain,
    modules: entry.relevance.modules,
    workspaces: entry.relevance.workspaces
  };
}
