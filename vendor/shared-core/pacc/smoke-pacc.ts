import { runPaccCheck } from '../pacc';

const cases = [
  runPaccCheck({
    signalId: 'pacc-test-allow',
    source: 'smoke',
    actorType: 'AUTOMATION',
    automationName: 'homebase-auto-run',
    actionRequested: 'process-safe-note',
    reversible: true,
    consequenceBearing: false,
    userCustodyPresent: true,
    evidenceCount: 1
  }),
  runPaccCheck({
    signalId: 'pacc-test-pause',
    source: 'smoke',
    actorType: 'AUTOMATION',
    automationName: 'child-content-flow',
    actionRequested: 'continue-autoplay',
    reversible: true,
    consequenceBearing: false,
    userCustodyPresent: true,
    parentCustodyRequired: true,
    parentCustodyPresent: false,
    evidenceCount: 1,
    driftDetected: true
  }),
  runPaccCheck({
    signalId: 'pacc-test-review',
    source: 'smoke',
    actorType: 'AUTOMATION',
    automationName: 'payment-release-flow',
    actionRequested: 'release-access',
    reversible: false,
    consequenceBearing: true,
    userCustodyPresent: false,
    evidenceCount: 1,
    missingProof: true,
    stageSkipping: true
  }),
  runPaccCheck({
    signalId: 'pacc-test-lock',
    source: 'smoke',
    actorType: 'AUTOMATION',
    automationName: 'unsafe-bot-flow',
    actionRequested: 'repeat-blocked-action',
    reversible: false,
    consequenceBearing: true,
    userCustodyPresent: false,
    evidenceCount: 3,
    verifiedError: true
  })
];

console.log(JSON.stringify(cases, null, 2));

const expected = ['ALLOW', 'PAUSE', 'REVIEW', 'LOCK'];
const actual = cases.map(c => c.state);

console.log('---- VERIFICATION ----');
console.log({ expected, actual });

if (JSON.stringify(expected) !== JSON.stringify(actual)) {
  throw new Error('PACC_SMOKE_FAILED');
}

console.log('PACC_SMOKE=PASS');
