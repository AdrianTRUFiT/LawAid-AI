import { runHomebasePaccGate } from './homebasePaccGate';

console.log('HB-SOS_PACC_GATE_V2=START');

const result = runHomebasePaccGate();

console.log(JSON.stringify(result, null, 2));

const completeOk = result.status === 'HB-SOS_PACC_GATE_V2_COMPLETE';

console.log('---- VERIFICATION ----');
console.log({
  completeOk,
  evaluated: result.evaluated,
  allow: result.allow,
  nudge: result.nudge,
  pause: result.pause,
  review: result.review,
  lock: result.lock
});

if (!completeOk) {
  throw new Error('HB_SOS_PACC_GATE_V2_FAILED');
}

console.log('HB-SOS_PACC_GATE_V2=PASS');
console.log('HB-SOS_PACC_GATE_V2=COMPLETE');
