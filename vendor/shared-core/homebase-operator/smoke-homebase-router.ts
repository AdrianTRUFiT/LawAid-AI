import { routeHomebaseReviewItems } from './homebaseRouter';

console.log('HB-SOS_ROUTER=START');

const result = routeHomebaseReviewItems();

console.log(JSON.stringify(result, null, 2));

const routedOk =
  result.status === 'HB-SOS_ROUTER_COMPLETE' &&
  result.routedCount >= 1;

const hardOk =
  result.records.some((r: any) => r.routes.includes('HARD'));

const governanceOk =
  result.records.some((r: any) => r.routes.includes('GOVERNANCE_REVIEW'));

console.log('---- VERIFICATION ----');
console.log({
  routedOk,
  hardOk,
  governanceOk
});

if (!routedOk || !hardOk || !governanceOk) {
  throw new Error('HB_SOS_ROUTER_FAILED');
}

console.log('HB-SOS_ROUTER=PASS');
console.log('HB-SOS_ROUTER=COMPLETE');
