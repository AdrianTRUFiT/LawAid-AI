import { RawKnowledgeInput, RuntimeKnowledgeRegistryEntry } from './knowledgeContracts';
import { makeId } from './knowledgeUtils';
import { captureSource } from './sourceCapture';
import { parseKnowledge } from './knowledgeParser';
import { classifyDomain } from './domainClassifier';
import { extractReusablePatterns, extractRiskClasses, mapArtifactStages } from './patternExtractor';
import { mapModules, mapWorkspaces } from './workspaceMapper';
import { buildEconomicImpact } from './economicImpact';
import { determineReviewStatus, buildReviewPacket } from './reviewPacketBuilder';
import { saveKnowledgeEntry } from './knowledgeRegistry';

export function intakeKnowledge(input: RawKnowledgeInput) {
  const signal = captureSource(input);
  const parsed = parseKnowledge(signal, input.body);

  const pattern = {
    patternId: makeId('KPATTERN', parsed),
    parsedId: parsed.parsedId,
    domain: classifyDomain(parsed),
    riskClasses: extractRiskClasses(parsed),
    artifactStages: mapArtifactStages(parsed),
    reusablePatterns: extractReusablePatterns(parsed)
  };

  const relevance = {
    mapId: makeId('KMAP', pattern),
    patternId: pattern.patternId,
    workspaces: mapWorkspaces(pattern),
    modules: mapModules(pattern)
  };

  const entry: RuntimeKnowledgeRegistryEntry = {
    entryId: makeId('KREG', { signal, parsed, pattern, relevance }),
    signal,
    parsed,
    pattern,
    relevance,
    economicImpact: buildEconomicImpact(pattern),
    reviewStatus: determineReviewStatus(pattern),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  saveKnowledgeEntry(entry);

  return {
    entry,
    reviewPacket: buildReviewPacket(entry)
  };
}
