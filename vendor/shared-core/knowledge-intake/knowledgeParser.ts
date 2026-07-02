import { CapturedKnowledgeSignal, ParsedIntelligenceObject } from './knowledgeContracts';
import { makeId } from './knowledgeUtils';

export function parseKnowledge(signal: CapturedKnowledgeSignal, fullBody: string): ParsedIntelligenceObject {
  const words = fullBody
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4);

  const keywords = Array.from(new Set(words)).slice(0, 18);

  return {
    parsedId: makeId('KPARSE', { signal, keywords }),
    signalId: signal.signalId,
    summary: fullBody.slice(0, 500),
    keywords
  };
}
