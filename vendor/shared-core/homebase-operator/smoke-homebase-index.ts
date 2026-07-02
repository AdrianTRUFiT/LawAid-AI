import { buildHomebaseIndex } from './homebaseIndex';

console.log('HB-SOS_INDEX=START');

const result = buildHomebaseIndex();

console.log(JSON.stringify(result, null, 2));

const reviewOk = result.totals.review >= 1;
const processedOk = result.totals.processed >= 1;
const indexBuiltOk = result.status === 'HB-SOS_INDEX_BUILT';

console.log('---- VERIFICATION ----');
console.log({
  reviewOk,
  processedOk,
  indexBuiltOk
});

if (!reviewOk || !processedOk || !indexBuiltOk) {
  throw new Error('HB_SOS_INDEX_FAILED');
}

console.log('HB-SOS_INDEX=PASS');
console.log('HB-SOS_INDEX=COMPLETE');
