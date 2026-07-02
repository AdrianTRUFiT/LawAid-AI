import fs from 'fs';
import {
  ActivatedTransactionState,
  LawAidAIWorkspace,
  applyPaidUnlock,
  buildExportPacketManifest,
  createExportUnlockProof,
  evaluatePaidUnlock,
  writeExportUnlockProof
} from '../lawaidai-product-path';

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error('ASSERTION_FAILED: ' + label);
  console.log('PASS:', label);
}

const workspace: LawAidAIWorkspace = {
  workspaceId: 'lwi4-workspace',
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

const noActivation = evaluatePaidUnlock(workspace);
assert(noActivation.allowed === false, 'Paid unlock refuses missing Activated Transaction State');
assert(noActivation.blocked.includes('ACTIVATED_TRANSACTION_STATE_REQUIRED'), 'Missing activation reason preserved');

const failedActivation: ActivatedTransactionState = {
  artifactType: 'ActivatedTransactionState',
  transactionId: 'txn-failed',
  workspaceId: workspace.workspaceId,
  userId: workspace.userId,
  productCode: 'LAWAIDAI_CASE_EXPORT_UNLOCK',
  status: 'failed',
  amount: 49,
  currency: 'USD',
  activatedAt: new Date().toISOString(),
  fundTrackerSeal: 'FTAI-SEAL-FAILED',
  source: 'TEST_STUB'
};

const failedDecision = evaluatePaidUnlock(workspace, failedActivation);
assert(failedDecision.allowed === false, 'Paid unlock refuses failed transaction state');

const staleActivation: ActivatedTransactionState = {
  ...failedActivation,
  transactionId: 'txn-stale',
  status: 'activated',
  expiresAt: new Date(Date.now() - 1000).toISOString(),
  fundTrackerSeal: 'FTAI-SEAL-STALE'
};

const staleDecision = evaluatePaidUnlock(workspace, staleActivation);
assert(staleDecision.allowed === false, 'Paid unlock refuses stale activation');
assert(staleDecision.status === 'PAID_UNLOCK_STALE', 'Stale activation status is explicit');

const wrongWorkspace: ActivatedTransactionState = {
  ...failedActivation,
  transactionId: 'txn-wrong-workspace',
  status: 'activated',
  workspaceId: 'other-workspace',
  fundTrackerSeal: 'FTAI-SEAL-WRONG'
};

const wrongWorkspaceDecision = evaluatePaidUnlock(workspace, wrongWorkspace);
assert(wrongWorkspaceDecision.allowed === false, 'Paid unlock refuses wrong workspace activation');

const validActivation: ActivatedTransactionState = {
  artifactType: 'ActivatedTransactionState',
  transactionId: 'txn-valid',
  workspaceId: workspace.workspaceId,
  userId: workspace.userId,
  productCode: 'LAWAIDAI_CASE_EXPORT_UNLOCK',
  status: 'activated',
  amount: 49,
  currency: 'USD',
  activatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  fundTrackerSeal: 'FTAI-SEAL-VALID-12345',
  source: 'TEST_STUB'
};

const validDecision = evaluatePaidUnlock(workspace, validActivation);
assert(validDecision.allowed === true, 'Paid unlock allows valid Activated Transaction State');

const proof = createExportUnlockProof(workspace, validActivation);
assert(proof.proofType === 'LAWAIDAI_EXPORT_UNLOCK_PROOF', 'Export unlock proof created');

const transitionResult = applyPaidUnlock(workspace, proof);
assert(transitionResult.workspace.paid === true, 'Workspace paid state becomes true');
assert(transitionResult.workspace.trialState === 'paid_unlocked', 'Workspace trial state becomes paid_unlocked');
assert(transitionResult.transition.transitionType === 'TRIAL_TO_PAID_TRANSITION', 'Trial-to-paid transition artifact created');

const persisted = writeExportUnlockProof(proof, transitionResult.transition);
assert(persisted.status === 'LWI_EXPORT_UNLOCK_PROOF_WRITTEN', 'Export unlock proof persisted');
assert(fs.existsSync(persisted.proofPath), 'Export unlock proof file exists');
assert(fs.existsSync(persisted.transitionPath), 'Trial-to-paid transition file exists');

const exportManifest = buildExportPacketManifest(transitionResult.workspace, 'export');
assert(exportManifest.manifest.status === 'EXPORT_PACKET_READY', 'Paid unlock enables export packet readiness');

console.log('');
console.log('LWI_4_TRIAL_TO_PAID_ACTIVATION_SMOKE=PASS');









