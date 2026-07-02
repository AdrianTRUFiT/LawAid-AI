import { KnowledgeDomain, ParsedIntelligenceObject } from './knowledgeContracts';

export function classifyDomain(parsed: ParsedIntelligenceObject): KnowledgeDomain {
  const text = (parsed.summary + ' ' + parsed.keywords.join(' ')).toLowerCase();

  if (text.includes('lawaid') || text.includes('legal') || text.includes('court')) return 'legal';
  if (text.includes('fundtracker') || text.includes('payment') || text.includes('roi') || text.includes('financial')) return 'financial';
  if (text.includes('supply') || text.includes('logistics') || text.includes('vendor')) return 'supply_chain';
  if (text.includes('attention') || text.includes('screen') || text.includes('child')) return 'attention_integrity';
  if (text.includes('synthetic') || text.includes('navigation') || text.includes('scn')) return 'synthetic_conditions';
  if (text.includes('continuity') || text.includes('fallback') || text.includes('mesh') || text.includes('home base')) return 'continuity_resilience';
  if (text.includes('launch') || text.includes('readiness')) return 'launch';
  if (text.includes('frontend') || text.includes('dashboard') || text.includes('paid')) return 'frontend';
  if (text.includes('backend') || text.includes('shared-core') || text.includes('runtime')) return 'backend';
  if (text.includes('aiva') || text.includes('rate') || text.includes('artifact')) return 'ecosystem_architecture';

  return 'unknown';
}
