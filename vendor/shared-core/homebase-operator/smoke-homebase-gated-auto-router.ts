import { runGatedAutoRouter } from './homebaseGatedAutoRouter';

console.log('HB-SOS_GATED_AUTO_ROUTER=START');

const result = runGatedAutoRouter();

console.log(JSON.stringify(result, null, 2));

const completeOk = result.status === 'HB-SOS_GATED_AUTO_ROUTER_COMPLETE';

console.log('---- VERIFICATION ----');
console.log({
  completeOk,
  routed: result.routed,
  blocked: result.blocked,
  executionCandidates: result.executionCandidates
});

if (!completeOk) {
  throw new Error('HB_SOS_GATED_AUTO_ROUTER_FAILED');
}

console.log('HB-SOS_GATED_AUTO_ROUTER=PASS');
console.log('HB-SOS_GATED_AUTO_ROUTER=COMPLETE');
