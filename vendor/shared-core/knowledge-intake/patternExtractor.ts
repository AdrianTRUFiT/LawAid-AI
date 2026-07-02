import { ArtifactStage, ParsedIntelligenceObject, RiskClass } from './knowledgeContracts';

export function extractRiskClasses(parsed: ParsedIntelligenceObject): RiskClass[] {
  const text = (parsed.summary + ' ' + parsed.keywords.join(' ')).toLowerCase();
  const risks: RiskClass[] = [];

  if (text.includes('verification') || text.includes('prove') || text.includes('proof')) risks.push('verification_gap');
  if (text.includes('authority') || text.includes('bypass') || text.includes('truth')) risks.push('authority_gap');
  if (text.includes('handoff') || text.includes('dependency') || text.includes('workflow')) risks.push('workflow_dependency_failure');
  if (text.includes('route') || text.includes('routing')) risks.push('route_failure');
  if (text.includes('payment') || text.includes('finality') || text.includes('transaction')) risks.push('payment_finality_risk');
  if (text.includes('document') || text.includes('custody') || text.includes('source')) risks.push('document_custody_risk');
  if (text.includes('attention') || text.includes('capture') || text.includes('screen')) risks.push('attention_capture_risk');
  if (text.includes('continuity') || text.includes('fallback') || text.includes('mesh')) risks.push('continuity_disruption');
  if (text.includes('doctrine') || text.includes('mutation') || text.includes('drift')) risks.push('doctrine_mutation_risk');

  return risks.length ? risks : ['none'];
}

export function mapArtifactStages(parsed: ParsedIntelligenceObject): ArtifactStage[] {
  const text = (parsed.summary + ' ' + parsed.keywords.join(' ')).toLowerCase();
  const stages: ArtifactStage[] = [];

  if (text.includes('raw') || text.includes('input') || text.includes('source')) stages.push('RAW_SIGNAL');
  if (text.includes('capture') || text.includes('captured')) stages.push('CAPTURED_SIGNAL');
  if (text.includes('verified') || text.includes('qualification') || text.includes('opportunity')) stages.push('VERIFIED_OPPORTUNITY');
  if (text.includes('transaction') || text.includes('activated') || text.includes('payment')) stages.push('ACTIVATED_TRANSACTION_STATE');
  if (text.includes('live system record') || text.includes('record') || text.includes('closure')) stages.push('LIVE_SYSTEM_RECORD');

  stages.push('RUNTIME_KNOWLEDGE_REGISTRY_ENTRY');

  return Array.from(new Set(stages));
}

export function extractReusablePatterns(parsed: ParsedIntelligenceObject): string[] {
  const risks = extractRiskClasses(parsed);
  return risks.map(r => r.toUpperCase());
}
