const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

const projectRoot = process.argv[2];

if (!projectRoot) {
  console.error('Usage: node scripts/make-step6-test-data.cjs <projectRoot>');
  process.exit(1);
}

const testDir = path.join(projectRoot, 'records', 'activation', 'testdata');
ensureDir(testDir);

const reviewedShell = {
  shellRecordId: 'shell-20260406-test-001',
  handoffId: '20260406-014114-TEST-009',
  targetApp: 'LawAidAI',
  sourceApp: 'FundTrackerAI',
  reviewStatus: 'approved',
  reviewedAt: new Date().toISOString(),
  reviewedBy: 'admin',
  identity: {
    email: 'test.user@example.com',
    fullName: 'Test User',
    userId: 'usr-test-001',
  },
  context: {
    caseType: 'family-law',
    matterId: 'matter-test-001',
    projectId: 'project-test-001',
    jurisdiction: 'FL',
  },
  initializationHints: {
    modules: ['tasks', 'events', 'documents', 'expenses', 'timeline', 'evidence'],
  },
};

const activatedTransactionState = {
  artifactType: 'ActivatedTransactionState',
  transactionStateId: 'ats-20260406-test-001',
  handoffId: '20260406-014114-TEST-009',
  sourceApp: 'FundTrackerAI',
  targetApp: 'LawAidAI',
  verifiedAt: new Date().toISOString(),
  transactionStatus: 'verified',
  activationPermitted: true,
  entitlement: {
    accessLevel: 'client',
    planId: 'launch-plan',
    modules: ['tasks', 'events', 'documents', 'expenses', 'timeline', 'evidence'],
  },
  routing: {
    destinationApp: 'LawAidAI',
    destinationMode: 'personal',
  },
  identity: {
    email: 'test.user@example.com',
    fullName: 'Test User',
    userId: 'usr-test-001',
  },
  context: {
    caseType: 'family-law',
    matterId: 'matter-test-001',
    projectId: 'project-test-001',
    jurisdiction: 'FL',
  },
};

const reviewedShellPath = path.join(testDir, 'reviewed-shell-test.json');
const atsPath = path.join(testDir, 'activated-transaction-state-test.json');

writeJson(reviewedShellPath, reviewedShell);
writeJson(atsPath, activatedTransactionState);

console.log('Test files created:');
console.log(reviewedShellPath);
console.log(atsPath);