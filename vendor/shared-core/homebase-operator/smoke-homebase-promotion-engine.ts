import { runHomebasePromotionEngine } from './homebasePromotionEngine';

console.log('HB-SOS_PROMOTION_ENGINE_V2=START');

const result = runHomebasePromotionEngine();

console.log(JSON.stringify(result, null, 2));

const completeOk = result.status === 'HB-SOS_PROMOTION_ENGINE_V2_COMPLETE';

console.log('---- VERIFICATION ----');
console.log({
  completeOk,
  evaluated: result.evaluated,
  promoted: result.promoted,
  denied: result.denied
});

if (!completeOk) {
  throw new Error('HB_SOS_PROMOTION_ENGINE_V2_FAILED');
}

console.log('HB-SOS_PROMOTION_ENGINE_V2=PASS');
console.log('HB-SOS_PROMOTION_ENGINE_V2=COMPLETE');
