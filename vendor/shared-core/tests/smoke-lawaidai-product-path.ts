import {
  calculateRevenueSnapshot,
  canUseTrialFeature,
  createSavedStateSnapshot,
  deriveTrialState,
  evaluateCasePathAction,
  restoreLastValidState,
  validateOutputReadiness,
  LawAidAIWorkspace,
  RevenueEvent
} from '../lawaidai-product-path';

function assert(condition: boolean, label: string) {
  if (!condition) {
    throw new Error('ASSERTION_FAILED: ' + label);
  }
  console.log('PASS:', label);
}

const workspace: LawAidAIWorkspace = {
  workspaceId: 'case-workspace-001',
  userId: 'user-001',
  caseType: 'family_case',
  currentStep: 'preview_ready',
  trialState: 'trial_active',
  paid: false,
  documents: ['petition.pdf', 'financial-affidavit.pdf'],
  timelineEntries: ['2026-04-01 intake event', '2026-04-10 filing event'],
  issueBuckets: ['parenting', 'expenses'],
  evidenceItems: ['petition.pdf#page1', 'financial-affidavit.pdf#page2'],
  communications: [],
  expenses: [],
  deadlines: [],
  tasks: [],
  notes: [],
  userConfirmedFacts: ['User confirmed filing date.'],
  confidence: 0.91,
  outputStatus: 'validated_preview'
};

const previewDecision = evaluateCasePathAction(workspace, 'PREVIEW_OUTPUT');
assert(previewDecision.allowed === true, 'Preview allowed when documents and structured state exist');

const exportTrialDecision = evaluateCasePathAction(workspace, 'EXPORT_PACKET');
assert(exportTrialDecision.allowed === false, 'Export blocked during unpaid trial');
assert(exportTrialDecision.blocked.includes('PAID_UNLOCK_REQUIRED'), 'Paid unlock required for export');

const snapshot = createSavedStateSnapshot(workspace);
assert(snapshot.workspaceId === workspace.workspaceId, 'Saved state snapshot created');

const restored = restoreLastValidState(snapshot);
assert(restored.workspaceId === workspace.workspaceId, 'Saved state restores workspace');

const validationBeforePay = validateOutputReadiness(workspace);
assert(validationBeforePay.exportAllowed === false, 'Validation blocks export before paid unlock');

workspace.paid = true;
workspace.trialState = 'paid_unlocked';
workspace.outputStatus = 'export_ready';

const validationAfterPay = validateOutputReadiness(workspace);
assert(validationAfterPay.exportAllowed === true, 'Validation allows export after paid unlock and source-grounded readiness');

const exportPaidDecision = evaluateCasePathAction(workspace, 'EXPORT_PACKET');
assert(exportPaidDecision.allowed === true, 'Export allowed after paid unlock and export readiness');

const trialState = deriveTrialState(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), false);
assert(trialState === 'trial_expiring', 'Trial state enters expiring window at day 5-7');

assert(canUseTrialFeature({ ...workspace, paid: false, trialState: 'trial_active' }, 'export') === false, 'Trial export remains restricted');

const revenueEvent: RevenueEvent = {
  eventId: 'rev-001',
  createdAt: new Date().toISOString(),
  source: 'search',
  campaign: 'legal-pressure-entry',
  keyword: 'organize divorce case documents',
  adSpend: 100,
  visitorCount: 200,
  trialStarts: 40,
  paidConversions: 10,
  refunds: 0,
  aiCost: 20,
  hostingCost: 10,
  grossRevenue: 300
};

const revenue = calculateRevenueSnapshot(revenueEvent);
assert(revenue.status === 'PROFITABLE', '$1 spend to $2+ revenue rule passes when ROAS >= 2 and net profit positive');

console.log('');
console.log('LWI_LAWAIDAI_PRODUCT_PATH_SMOKE=PASS');









