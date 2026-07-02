import { canSystemExecute, evaluateFailureState } from './failureEvaluator';

const healthy = [
  { module: "AI_TRACK", state: "ONLINE" },
  { module: "UTILITY_CONTAINER", state: "ONLINE" },
  { module: "SMART_UTILITY", state: "ONLINE" },
  { module: "PERMISSION_MATRIX", state: "ONLINE" },
  { module: "EXECUTION_CONTEXT", state: "ONLINE" },
  { module: "HIL_SWITCHYARD", state: "ONLINE" },
  { module: "PERSISTENT_LEDGER", state: "ONLINE" }
];

const ledgerDown = [
  ...healthy.filter(s => s.module !== "PERSISTENT_LEDGER"),
  { module: "PERSISTENT_LEDGER", state: "OFFLINE" }
];

const contextUnknown = [
  ...healthy.filter(s => s.module !== "EXECUTION_CONTEXT"),
  { module: "EXECUTION_CONTEXT", state: "UNKNOWN" }
];

const frontendDegraded = [
  ...healthy,
  { module: "FRONTEND_SURFACE", state: "DEGRADED" }
];

console.log("FAILURE_MAP_V1=START");

console.log("----");
console.log("HEALTHY_SYSTEM");
console.log(canSystemExecute(healthy as any));

console.log("----");
console.log("LEDGER_DOWN");
console.log(canSystemExecute(ledgerDown as any));

console.log("----");
console.log("CONTEXT_UNKNOWN");
console.log(canSystemExecute(contextUnknown as any));

console.log("----");
console.log("FRONTEND_DEGRADED");
console.log(evaluateFailureState("FRONTEND_SURFACE", "DEGRADED"));

console.log("FAILURE_MAP_V1=COMPLETE");
