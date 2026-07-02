const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function fail(message, code = 1) {
  console.error(`STEP 6 REFUSED: ${message}`);
  process.exit(code);
}

function requiredString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function makeActivationKey(shellRecordId, transactionStateId) {
  return crypto
    .createHash('sha256')
    .update(`${shellRecordId}::${transactionStateId}`)
    .digest('hex')
    .slice(0, 24);
}

function defaultModules(reviewedShell, ats) {
  const fromEntitlement = ats?.entitlement?.modules;
  if (Array.isArray(fromEntitlement) && fromEntitlement.length > 0) return fromEntitlement;

  const fromHints = reviewedShell?.initializationHints?.modules;
  if (Array.isArray(fromHints) && fromHints.length > 0) return fromHints;

  return ['tasks', 'events', 'documents', 'expenses', 'timeline', 'evidence'];
}

const projectRoot = process.argv[2];
const reviewedShellPath = process.argv[3];
const activatedTransactionStatePath = process.argv[4];

if (!projectRoot || !reviewedShellPath || !activatedTransactionStatePath) {
  fail(
    'Usage: node scripts/activate-reviewed-shell.cjs <projectRoot> <reviewedShellPath> <activatedTransactionStatePath>',
  );
}

if (!fs.existsSync(reviewedShellPath)) fail(`Reviewed shell file not found: ${reviewedShellPath}`);
if (!fs.existsSync(activatedTransactionStatePath)) {
  fail(`Activated Transaction State file not found: ${activatedTransactionStatePath}`);
}

const reviewedShell = readJson(reviewedShellPath);
const ats = readJson(activatedTransactionStatePath);

if (reviewedShell.targetApp !== 'LawAidAI' || ats.targetApp !== 'LawAidAI') {
  fail('Wrong target app. Both artifacts must target LawAidAI.');
}

if (reviewedShell.reviewStatus !== 'approved') {
  fail('Reviewed shell is not approved.');
}

if (ats.artifactType !== 'ActivatedTransactionState') {
  fail('Artifact type is not ActivatedTransactionState.');
}

if (ats.activationPermitted !== true) {
  fail('Activation is not permitted by FundTrackerAI truth.');
}

if (!requiredString(reviewedShell.shellRecordId)) {
  fail('Missing shellRecordId on reviewed shell.');
}

if (!requiredString(ats.transactionStateId)) {
  fail('Missing transactionStateId on Activated Transaction State.');
}

const activationKey = makeActivationKey(reviewedShell.shellRecordId, ats.transactionStateId);

const activationDir = path.join(projectRoot, 'records', 'activation');
const liveDir = path.join(projectRoot, 'records', 'live');

ensureDir(activationDir);
ensureDir(liveDir);

const activationEnvelopePath = path.join(
  activationDir,
  `activation-envelope-${activationKey}.json`,
);
const liveRecordPath = path.join(liveDir, `live-record-${activationKey}.json`);

if (fs.existsSync(liveRecordPath)) {
  fail(`Duplicate activation refused. Live record already exists: ${liveRecordPath}`);
}

const allowedModules = defaultModules(reviewedShell, ats);

const envelope = {
  envelopeType: 'LawAidAIActivationEnvelope',
  envelopeVersion: '1.0',
  createdAt: new Date().toISOString(),
  gapStatus: 'VERIFIED',
  reviewedShell,
  activatedTransactionState: ats,
  activationKey,
  allowedModules,
};

const liveRecord = {
  artifactType: 'LiveSystemRecord',
  recordVersion: '1.0',
  liveRecordId: `lsr-${activationKey}`,
  activationKey,
  createdAt: new Date().toISOString(),
  source: {
    reviewedShellRecordId: reviewedShell.shellRecordId,
    transactionStateId: ats.transactionStateId,
    handoffId: reviewedShell.handoffId || ats.handoffId || null,
  },
  workspace: {
    workspaceId: `lawaid-workspace-${
      reviewedShell?.context?.projectId ||
      ats?.context?.projectId ||
      reviewedShell?.handoffId ||
      ats?.handoffId ||
      'workspace'
    }`,
    projectId:
      reviewedShell?.context?.projectId ||
      ats?.context?.projectId ||
      reviewedShell?.context?.matterId ||
      ats?.context?.matterId ||
      reviewedShell?.handoffId ||
      ats?.handoffId ||
      'unscoped-project',
    matterId: reviewedShell?.context?.matterId || ats?.context?.matterId || null,
    status: 'active',
  },
  identity: {
    email: reviewedShell?.identity?.email || ats?.identity?.email || null,
    fullName: reviewedShell?.identity?.fullName || ats?.identity?.fullName || null,
    userId: reviewedShell?.identity?.userId || ats?.identity?.userId || null,
  },
  modules: allowedModules,
  continuity: {
    continuityStartedAt: new Date().toISOString(),
    active: true,
  },
  marks: [
    {
      type: 'ACTIVATION_CONFIRMED',
      at: new Date().toISOString(),
      by: 'Step6ActivationEngine',
      evidence: [reviewedShellPath, activatedTransactionStatePath],
    },
  ],
};

writeJson(activationEnvelopePath, envelope);
writeJson(liveRecordPath, liveRecord);

console.log('STEP 6 ACCEPTED');
console.log(`Activation envelope: ${activationEnvelopePath}`);
console.log(`Live System Record: ${liveRecordPath}`);