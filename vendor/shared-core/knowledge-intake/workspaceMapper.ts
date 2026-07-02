import { ClassifiedSystemPattern, WorkspaceTarget } from './knowledgeContracts';

export function mapWorkspaces(pattern: ClassifiedSystemPattern): WorkspaceTarget[] {
  const targets = new Set<WorkspaceTarget>();

  targets.add('HARD');
  targets.add('AIVA_Command_Center');

  if (pattern.riskClasses.includes('authority_gap') || pattern.riskClasses.includes('doctrine_mutation_risk')) targets.add('PONG');
  if (pattern.riskClasses.includes('verification_gap') || pattern.riskClasses.includes('payment_finality_risk')) targets.add('MARK');
  if (pattern.domain === 'legal') targets.add('LawAidAI');
  if (pattern.domain === 'financial') {
    targets.add('FundTrackerAI');
    targets.add('FinTechionAI');
  }
  if (pattern.domain === 'supply_chain') targets.add('LAIW');
  if (pattern.domain === 'attention_integrity') targets.add('PAID');
  if (pattern.domain === 'synthetic_conditions') targets.add('PAID');
  if (pattern.domain === 'backend') targets.add('PING');
  if (pattern.domain === 'frontend') targets.add('PAID');
  if (pattern.domain === 'ecosystem_architecture') {
    targets.add('PING');
    targets.add('PONG');
    targets.add('MARK');
  }

  return Array.from(targets);
}

export function mapModules(pattern: ClassifiedSystemPattern): string[] {
  const modules = new Set<string>();

  modules.add('knowledge-intake');

  if (pattern.domain === 'legal') modules.add('LawAidAI');
  if (pattern.domain === 'financial') modules.add('FundTrackerAI');
  if (pattern.domain === 'financial') modules.add('FinTechionAI');
  if (pattern.domain === 'supply_chain') modules.add('LAIW');
  if (pattern.domain === 'attention_integrity') modules.add('attention-integrity');
  if (pattern.domain === 'synthetic_conditions') modules.add('SCN');
  if (pattern.domain === 'continuity_resilience') modules.add('continuity-resilience');
  if (pattern.riskClasses.includes('doctrine_mutation_risk')) modules.add('governance-review');
  if (pattern.riskClasses.includes('payment_finality_risk')) modules.add('fundtracker-bridge');

  return Array.from(modules);
}
