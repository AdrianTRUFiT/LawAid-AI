import { RawKnowledgeInput, CapturedKnowledgeSignal } from './knowledgeContracts';
import { sha, makeId } from './knowledgeUtils';

export function captureSource(input: RawKnowledgeInput): CapturedKnowledgeSignal {
  if (!input.body || input.body.trim().length < 10) {
    throw new Error('RAW_KNOWLEDGE_BODY_REQUIRED');
  }

  return {
    signalId: makeId('KSIG', input),
    sourceType: input.sourceType,
    title: input.title || 'Untitled Knowledge Signal',
    bodyHash: sha(input.body),
    bodyPreview: input.body.slice(0, 280),
    submittedBy: input.submittedBy,
    sourceLabel: input.sourceLabel,
    capturedAt: Date.now()
  };
}
