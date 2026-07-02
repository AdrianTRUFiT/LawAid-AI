import { ClassifiedSystemPattern, EconomicImpactProfile } from './knowledgeContracts';

export function buildEconomicImpact(pattern: ClassifiedSystemPattern): EconomicImpactProfile {
  const risks = pattern.riskClasses;

  return {
    timeSavings:
      risks.includes('workflow_dependency_failure') || risks.includes('route_failure') ? 'high' : 'medium',
    errorReduction:
      risks.includes('verification_gap') || risks.includes('authority_gap') ? 'high' : 'medium',
    riskAvoidance:
      risks.includes('payment_finality_risk') || risks.includes('document_custody_risk') || risks.includes('doctrine_mutation_risk') ? 'high' : 'medium',
    throughputGain:
      risks.includes('workflow_dependency_failure') || risks.includes('route_failure') ? 'high' : 'low'
  };
}
