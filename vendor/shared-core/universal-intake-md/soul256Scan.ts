import { IntakeRouteTarget, Soul256Scan, UniversalRawInput } from './intakeMdContracts';
import { makeId } from './intakeMdUtils';

export function runSoul256Scan(input: UniversalRawInput): Soul256Scan {
  const text = (input.title + ' ' + input.body).toLowerCase();
  const riskFlags: string[] = [];
  const continuityFlags: string[] = [];
  const routes = new Set<IntakeRouteTarget>();

  routes.add('Knowledge_Intake');
  routes.add('AIVA_Command_Center');

  if (text.includes('doctrine') || text.includes('authority') || text.includes('mutation')) {
    riskFlags.push('DOCTRINE_OR_AUTHORITY_REVIEW_REQUIRED');
    routes.add('PONG');
    routes.add('MARK');
    routes.add('HARD');
  }

  if (text.includes('payment') || text.includes('transaction') || text.includes('roi') || text.includes('financial')) {
    riskFlags.push('FINANCIAL_OR_TRANSACTION_IMPACT');
    routes.add('FundTrackerAI');
    routes.add('MARK');
  }

  if (text.includes('lawaid') || text.includes('legal') || text.includes('court')) {
    routes.add('LawAidAI');
  }

  if (text.includes('logistics') || text.includes('supply') || text.includes('route') || text.includes('vendor')) {
    routes.add('LAIW');
  }

  if (text.includes('frontend') || text.includes('paid') || text.includes('dashboard') || text.includes('user')) {
    routes.add('PAID');
  }

  if (text.includes('continuity') || text.includes('fallback') || text.includes('mesh') || text.includes('reconcile')) {
    continuityFlags.push('CONTINUITY_RELEVANT');
    routes.add('PING');
  }

  if (riskFlags.length === 0) riskFlags.push('NO_IMMEDIATE_HIGH_RISK_FLAG');
  if (continuityFlags.length === 0) continuityFlags.push('STANDARD_CONTINUITY');

  return {
    scanId: makeId('SOUL256SCAN', input),
    purpose: 'INTAKE_CLASSIFICATION_AND_ROUTING',
    riskFlags,
    continuityFlags,
    recommendedRoutes: Array.from(routes)
  };
}
