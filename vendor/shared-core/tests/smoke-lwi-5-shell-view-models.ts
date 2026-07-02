import {
  ActivatedTransactionState,
  LawAidAIWorkspace,
  RevenueEvent,
  buildShellProductPathAdapter
} from '../lawaidai-product-path';
import { HumanComputerEntrySignal } from '../human-computer-continuity';

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + label);
  console.log('PASS:', label);
}

const incompleteContinuity: HumanComputerEntrySignal = {
  signalId: 'shell-sig-001',
  dashboardSurface: 'law-aid-dashboard',
  source: 'market-entry',
  capturedAt: new Date().toISOString(),
  attentionCaptured: true,
  statedIntent: 'I need help organizing my case.',
  authorshipVerified: false,
  humanApproved: false
};

const completeContinuity: HumanComputerEntrySignal = {
  signalId: 'shell-sig-002',
  dashboardSurface: 'law-aid-dashboard',
  source: 'market-entry',
  capturedAt: new Date().toISOString(),
  attentionCaptured: true,
  statedIntent: 'I need help organizing my case.',
  structuredIntent: 'organize_legal_case_documents',
  clarityStatement: 'User needs client-side organization, timeline, and export preparation.',
  soulMarkId: 'SOULMARK-USER-001',
  authorshipVerified: true,
  humanApproved: true,
  artifactType: 'VerifiedOpportunity'
};

const workspace: LawAidAIWorkspace = {
  workspaceId: 'lwi5-workspace',
  userId: 'user-001',
  caseType: 'family_case',
  currentStep: 'preview_ready',
  trialState: 'trial_active',
  paid: false,
  documents: ['petition.pdf'],
  timelineEntries: ['2026-04-01 intake event'],
  issueBuckets: ['parenting'],
  evidenceItems: ['petition.pdf#page1'],
  communications: ['2026-04-03 email to counsel'],
  expenses: ['Filing fee 400'],
  deadlines: ['2026-05-01 hearing'],
  tasks: ['Review packet'],
  notes: ['Ready for export after paid unlock'],
  userConfirmedFacts: ['User confirmed filing date', 'User confirmed issue bucket labels'],
  confidence: 0.92,
  outputStatus: 'export_ready'
};

const blockedAdapter = buildShellProductPathAdapter({
  workspace,
  entrySignal: incompleteContinuity
});

assert(blockedAdapter.continuity.movementAllowed === false, 'Shell consumes continuity layer and blocks incomplete entry movement');
assert(blockedAdapter.workspace.shellState === 'entry_blocked' || blockedAdapter.workspace.shellState === 'needs_authorship', 'Shell state reflects continuity blockage');
assert(blockedAdapter.boundary.includes('UI does not create authority.'), 'Shell boundary states UI does not create authority');

const noActivationAdapter = buildShellProductPathAdapter({
  workspace,
  entrySignal: completeContinuity
});

assert(noActivationAdapter.continuity.movementAllowed === true, 'Complete continuity permits shell movement reflection');
assert(noActivationAdapter.exportLock.locked === true, 'Export remains locked without Activated Transaction State');
assert(noActivationAdapter.exportLock.reasons.includes('ACTIVATED_TRANSACTION_STATE_REQUIRED'), 'Export lock reflects missing activation proof');

const paidWorkspace: LawAidAIWorkspace = {
  ...workspace,
  paid: true,
  trialState: 'paid_unlocked'
};

const activation: ActivatedTransactionState = {
  artifactType: 'ActivatedTransactionState',
  transactionId: 'txn-lwi5-valid',
  workspaceId: paidWorkspace.workspaceId,
  userId: paidWorkspace.userId,
  productCode: 'LAWAIDAI_CASE_EXPORT_UNLOCK',
  status: 'activated',
  amount: 49,
  currency: 'USD',
  activatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  fundTrackerSeal: 'FTAI-SEAL-LWI5-VALID',
  source: 'TEST_STUB'
};

const revenueEvent: RevenueEvent = {
  eventId: 'rev-lwi5',
  createdAt: new Date().toISOString(),
  source: 'search',
  campaign: 'legal-pressure-entry',
  keyword: 'organize legal documents',
  adSpend: 100,
  visitorCount: 300,
  trialStarts: 60,
  paidConversions: 15,
  refunds: 0,
  aiCost: 20,
  hostingCost: 10,
  grossRevenue: 350
};

const readyAdapter = buildShellProductPathAdapter({
  workspace: paidWorkspace,
  entrySignal: completeContinuity,
  activation,
  revenueEvent
});

assert(readyAdapter.workspace.shellState === 'export_ready', 'Shell reflects export_ready when continuity, readiness, and activation are valid');
assert(readyAdapter.exportLock.exportAllowed === true, 'Export lock view model reflects export allowed');
assert(readyAdapter.trialBanner.severity === 'success', 'Trial banner reflects paid unlock success');
assert(readyAdapter.revenueDashboard.status === 'PROFITABLE', 'Revenue dashboard reflects profitable economics');
assert(readyAdapter.boundary.includes('Shell reflects governed state only.'), 'Adapter boundary preserves governed-state reflection');

console.log('');
console.log('LWI_5_SHELL_VIEW_MODELS_SMOKE=PASS');









