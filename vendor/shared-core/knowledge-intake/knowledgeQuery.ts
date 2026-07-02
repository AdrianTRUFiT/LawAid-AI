import { ArtifactStage, KnowledgeDomain, RiskClass, WorkspaceTarget } from './knowledgeContracts';
import { listKnowledgeEntries } from './knowledgeRegistry';

export function getKnowledgeByDomain(domain: KnowledgeDomain) {
  return listKnowledgeEntries().filter(e => e.pattern.domain === domain);
}

export function getPatternsByRiskClass(riskClass: RiskClass) {
  return listKnowledgeEntries().filter(e => e.pattern.riskClasses.includes(riskClass));
}

export function getKnowledgeForWorkspace(workspace: WorkspaceTarget) {
  return listKnowledgeEntries().filter(e => e.relevance.workspaces.includes(workspace));
}

export function getKnowledgeForModule(module: string) {
  return listKnowledgeEntries().filter(e => e.relevance.modules.includes(module));
}

export function getKnowledgeAffectingArtifactStage(stage: ArtifactStage) {
  return listKnowledgeEntries().filter(e => e.pattern.artifactStages.includes(stage));
}

export function getKnowledgeByEconomicImpact(impact: keyof import('./knowledgeContracts').EconomicImpactProfile, level: 'low' | 'medium' | 'high') {
  return listKnowledgeEntries().filter(e => e.economicImpact[impact] === level);
}

export function getHighestFinancialLeakPatterns() {
  return listKnowledgeEntries().filter(e =>
    e.economicImpact.timeSavings === 'high' ||
    e.economicImpact.errorReduction === 'high' ||
    e.economicImpact.riskAvoidance === 'high' ||
    e.economicImpact.throughputGain === 'high'
  );
}

export function getRelevantKnowledgeForPromptContext(input: {
  workspace?: WorkspaceTarget;
  module?: string;
  riskClass?: RiskClass;
}) {
  return listKnowledgeEntries().filter(e => {
    if (input.workspace && !e.relevance.workspaces.includes(input.workspace)) return false;
    if (input.module && !e.relevance.modules.includes(input.module)) return false;
    if (input.riskClass && !e.pattern.riskClasses.includes(input.riskClass)) return false;
    return true;
  });
}
