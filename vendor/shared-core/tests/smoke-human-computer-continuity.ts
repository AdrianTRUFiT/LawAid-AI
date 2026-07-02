import {
  buildDeviceDashboardContinuityViewModel,
  evaluateHumanComputerContinuity,
  HumanComputerEntrySignal
} from '../human-computer-continuity';

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + label);
  console.log('PASS:', label);
}

const attentionOnly: HumanComputerEntrySignal = {
  signalId: 'sig-001',
  dashboardSurface: 'law-aid-entry-dashboard',
  source: 'market-entry',
  capturedAt: new Date().toISOString(),
  attentionCaptured: true,
  statedIntent: 'I need help organizing my case.',
  authorshipVerified: false,
  humanApproved: false
};

const attentionDecision = evaluateHumanComputerContinuity(attentionOnly);
assert(attentionDecision.movementAllowed === false, 'Attention alone cannot move to consequence');
assert(attentionDecision.failedConditions.includes('intent_structured'), 'Structured intent is required after attention');

const clearButNoAuthorship: HumanComputerEntrySignal = {
  ...attentionOnly,
  signalId: 'sig-002',
  structuredIntent: 'organize_legal_case_documents',
  clarityStatement: 'User needs client-side organization, timeline, and export preparation.',
  authorshipVerified: false
};

const clarityDecision = evaluateHumanComputerContinuity(clearButNoAuthorship);
assert(clarityDecision.movementAllowed === false, 'Trusted clarity without authorship cannot move to consequence');
assert(clarityDecision.status === 'needs_authorship', 'Missing authorship produces needs_authorship status');

const authorshipButNoAuthority: HumanComputerEntrySignal = {
  ...clearButNoAuthorship,
  signalId: 'sig-003',
  soulMarkId: 'SOULMARK-USER-001',
  authorshipVerified: true,
  humanApproved: false
};

const authorityDecision = evaluateHumanComputerContinuity(authorshipButNoAuthority);
assert(authorityDecision.movementAllowed === false, 'Verified authorship without authority cannot move to consequence');
assert(authorityDecision.status === 'needs_authority', 'Missing authority produces needs_authority status');

const completeSignal: HumanComputerEntrySignal = {
  ...authorshipButNoAuthority,
  signalId: 'sig-004',
  humanApproved: true,
  artifactType: 'VerifiedOpportunity'
};

const completeDecision = evaluateHumanComputerContinuity(completeSignal);
assert(completeDecision.movementAllowed === true, 'Structured intent, clarity, authorship, and authority allow governed movement');
assert(completeDecision.currentStage === 'consequence_ready', 'Complete conditions reach consequence_ready boundary');

const viewModel = buildDeviceDashboardContinuityViewModel(completeSignal);
assert(viewModel.movementAllowed === true, 'Dashboard view model reflects governed movement permission');
assert(viewModel.visibleMessage.includes('governed artifact law'), 'Dashboard message preserves artifact law boundary');

console.log('');
console.log('HUMAN_COMPUTER_CONTINUITY_SMOKE=PASS');









