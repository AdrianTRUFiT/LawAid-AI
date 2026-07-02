import { runHomebaseDecisionEngine } from './homebaseDecisionEngine';

console.log('HB-SOS_DECISION_ENGINE=START');

const result = runHomebaseDecisionEngine();

console.log(JSON.stringify(result, null, 2));

const completeOk =
  result.status === 'HB-SOS_DECISION_ENGINE_COMPLETE' ||
  result.status === 'HB-SOS_DECISION_NO_REVIEW_ITEMS';

const decidedOk =
  result.status === 'HB-SOS_DECISION_NO_REVIEW_ITEMS' ||
  result.decided >= 1;

console.log('---- VERIFICATION ----');
console.log({
  completeOk,
  decidedOk
});

if (!completeOk || !decidedOk) {
  throw new Error('HB_SOS_DECISION_ENGINE_FAILED');
}

console.log('HB-SOS_DECISION_ENGINE=PASS');
console.log('HB-SOS_DECISION_ENGINE=COMPLETE');
