import { activateAndCloseOnePacket } from './homebaseActiveClose';

console.log('HB-SOS_ACTIVE_CLOSE=START');

const result = activateAndCloseOnePacket();

console.log(JSON.stringify(result, null, 2));

const completeOk = result.status === 'HB-SOS_ACTIVE_CLOSE_COMPLETE';
const closedOk = completeOk && result.record.finalStatus === 'CLOSED';

console.log('---- VERIFICATION ----');
console.log({
  completeOk,
  closedOk
});

if (!completeOk || !closedOk) {
  throw new Error('HB_SOS_ACTIVE_CLOSE_FAILED');
}

console.log('HB-SOS_ACTIVE_CLOSE=PASS');
console.log('HB-SOS_ACTIVE_CLOSE=COMPLETE');
