import { setPaccMode } from '../pacc-control';
import { runHomebaseRouter } from './homebaseRouter';
import { runHomebaseExecutor } from './homebaseExecutor';

console.log('HB-SOS_ROUTER_EXECUTOR_CLEAN=START');

setPaccMode('ON');

const router = runHomebaseRouter();
const executor = runHomebaseExecutor();

console.log({
  router: {
    status: router.status,
    evaluated: router.evaluated,
    toExecution: router.toExecution,
    toHold: router.toHold,
    toReview: router.toReview,
    toDenied: router.toDenied
  },
  executor: {
    status: executor.status,
    evaluated: executor.evaluated,
    executed: executor.executed,
    denied: executor.denied
  }
});

const routerOk = router.status === 'HB-SOS_ROUTER_COMPLETE';
const executorOk = executor.status === 'HB-SOS_EXECUTOR_COMPLETE';

console.log('---- VERIFICATION ----');
console.log({ routerOk, executorOk });

if (!routerOk || !executorOk) {
  throw new Error('HB_SOS_ROUTER_EXECUTOR_CLEAN_FAILED');
}

console.log('HB-SOS_ROUTER_EXECUTOR_CLEAN=PASS');
console.log('HB-SOS_ROUTER_EXECUTOR_CLEAN=COMPLETE');
