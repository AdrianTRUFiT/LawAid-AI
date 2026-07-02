import {
  LawAidAIWorkspace,
  RevenueEvent,
  scoreWorkspaceCompletion,
  evaluateExportReadiness,
  classifyConversionMoment,
  writeRevenueManifest,
  deriveTrialState,
  canUseTrialFeature
} from '../lawaidai-product-path';

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + label);
  console.log('PASS:', label);
}

const incomplete: LawAidAIWorkspace = {
  workspaceId: 'case-workspace-incomplete',
  userId: 'user-001',
  caseType: 'family_case',
  currentStep: 'case_created',
  trialState: 'trial_active',
  paid: false,
  documents: [],
  timelineEntries: [],
  issueBuckets: [],
  evidenceItems: [],
  communications: [],
  expenses: [],
  deadlines: [],
  tasks: [],
  notes: [],
  userConfirmedFacts: [],
  confidence: 0.5,
  outputStatus: 'draft_only'
};

const missing = scoreWorkspaceCompletion(incomplete);
assert(missing.previewReady === false, 'Incomplete workspace is not preview ready');
assert(missing.missingItems.some(i => i.code === 'DOCUMENTS_REQUIRED'), 'Missing-item checklist detects missing documents');

const preview: LawAidAIWorkspace = {
  ...incomplete,
  workspaceId: 'case-workspace-preview',
  currentStep: 'preview_ready',
  documents: ['petition.pdf'],
  timelineEntries: ['2026-04-01 event'],
  issueBuckets: ['parenting'],
  confidence: 0.86,
  outputStatus: 'validated_preview'
};

const previewScore = scoreWorkspaceCompletion(preview);
assert(previewScore.previewReady === true, 'Workspace becomes preview ready when required preview items exist');
assert(previewScore.exportCandidate === false, 'Preview-ready workspace is not export candidate without evidence and confirmed facts');

const conversion = classifyConversionMoment(preview);
assert(conversion.show === true, 'Conversion moment appears when preview value is visible');
assert(conversion.moment === 'PREVIEW_READY_COMPLETE_PACKET', 'Preview-ready conversion moment classified correctly');

const paidReady: LawAidAIWorkspace = {
  ...preview,
  paid: true,
  trialState: 'paid_unlocked',
  evidenceItems: ['petition.pdf#page1'],
  userConfirmedFacts: ['User confirmed filing date'],
  outputStatus: 'export_ready',
  confidence: 0.91
};

const exportGate = evaluateExportReadiness(paidReady);
assert(exportGate.exportAllowed === true, 'Export readiness gate allows paid source-grounded complete workspace');
assert(exportGate.status === 'ready', 'Export readiness status is ready');

const locked: LawAidAIWorkspace = {
  ...preview,
  trialState: 'trial_locked',
  paid: false
};

assert(canUseTrialFeature(locked, 'edit') === false, 'Trial expiration blocks editing');
assert(deriveTrialState(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), false) === 'trial_locked', 'Trial locks after day 7');

const lockedConversion = classifyConversionMoment(locked);
assert(lockedConversion.moment === 'TRIAL_LOCKED_UPGRADE_TO_CONTINUE', 'Trial-locked conversion moment classified correctly');

const blockedExport = evaluateExportReadiness(preview);
assert(blockedExport.exportAllowed === false, 'Export readiness blocks unpaid preview workspace');
assert(blockedExport.reasons.includes('PAID_UNLOCK_REQUIRED'), 'Export readiness includes paid unlock reason');

const revenueEvent: RevenueEvent = {
  eventId: 'lwi2-rev-001',
  createdAt: new Date().toISOString(),
  source: 'search',
  campaign: 'legal-pressure-entry',
  keyword: 'organize legal case documents',
  adSpend: 100,
  visitorCount: 250,
  trialStarts: 50,
  paidConversions: 12,
  refunds: 0,
  aiCost: 25,
  hostingCost: 10,
  grossRevenue: 320
};

const manifest = writeRevenueManifest(revenueEvent);
assert(manifest.status === 'LWI_REVENUE_MANIFEST_BUILT', 'Revenue manifest is built');
assert(manifest.snapshot.status === 'PROFITABLE', 'Revenue manifest preserves profitable status');

console.log('');
console.log('LWI_2_WORKSPACE_EXPORT_REVENUE_SMOKE=PASS');









