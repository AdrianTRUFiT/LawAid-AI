import { setPaccMode } from '../pacc-control';
import { runHomebasePaccGate } from './homebasePaccGate';

function runMode(mode: 'ON' | 'OFF' | 'LIMITED') {
  setPaccMode(mode);

  console.log('---- MODE ' + mode + ' ----');

  const result = runHomebasePaccGate();

  console.log({
    mode,
    status: result.status,
    evaluated: result.evaluated,
    allow: result.allow,
    nudge: result.nudge,
    pause: result.pause,
    review: result.review,
    lock: result.lock
  });

  return result;
}

console.log('HB-SOS_PACC_CONTROLLED_GATE=START');

const onResult = runMode('ON');
const offResult = runMode('OFF');
const limitedResult = runMode('LIMITED');

const onOk = onResult.review >= 1 && onResult.lock >= 1;
const offOk = offResult.allow === offResult.evaluated;
const limitedOk = limitedResult.review >= 1 && limitedResult.lock >= 1;

console.log('---- VERIFICATION ----');
console.log({ onOk, offOk, limitedOk });

if (!onOk || !offOk || !limitedOk) {
  throw new Error('HB_SOS_PACC_CONTROLLED_GATE_FAILED');
}

setPaccMode('ON');

console.log('HB-SOS_PACC_CONTROLLED_GATE=PASS');
console.log('HB-SOS_PACC_CONTROLLED_GATE=COMPLETE');
