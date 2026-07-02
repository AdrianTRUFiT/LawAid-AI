import { runHomebaseExecutor } from './homebaseExecutor';

console.log('HB-SOS_EXECUTOR=START');

const result = runHomebaseExecutor();

console.log(JSON.stringify(result, null, 2));

const completeOk = result.status === 'HB-SOS_EXECUTOR_COMPLETE';

console.log('---- VERIFICATION ----');
console.log({
  completeOk,
  evaluated: result.evaluated,
  executed: result.executed,
  denied: result.denied
});

if (!completeOk) {
  throw new Error('HB_SOS_EXECUTOR_FAILED');
}

console.log('HB-SOS_EXECUTOR=PASS');
console.log('HB-SOS_EXECUTOR=COMPLETE');
