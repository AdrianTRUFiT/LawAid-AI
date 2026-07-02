import { runHomebaseQueueTruth } from './homebaseQueueTruth';

console.log('HB-SOS_QUEUE_TRUTH=START');

const result = runHomebaseQueueTruth();

console.log(JSON.stringify(result, null, 2));

const ok = result.status === 'HB-SOS_QUEUE_TRUTH_COMPLETE';

console.log('---- VERIFICATION ----');
console.log({
  ok,
  evaluated: result.evaluated,
  kept: result.kept,
  duplicates: result.duplicates,
  archivedDenied: result.archivedDenied
});

if (!ok) {
  throw new Error('HB_SOS_QUEUE_TRUTH_FAILED');
}

console.log('HB-SOS_QUEUE_TRUTH=PASS');
console.log('HB-SOS_QUEUE_TRUTH=COMPLETE');
