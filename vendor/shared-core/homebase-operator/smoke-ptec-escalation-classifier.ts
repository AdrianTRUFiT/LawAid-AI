import { classifyPTECEscalation } from "./ptecEscalationClassifier.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const informational = classifyPTECEscalation("SIGNAL_KIND: INFO\nMESSAGE: status only");
assert(informational.escalationState === "ALLOW_TO_QUEUE", "informational should allow to queue");

const executionReady = classifyPTECEscalation("SIGNAL_KIND: ALLOW\nACTION: CREATE_LIVE_SYSTEM_RECORD\nPROOF_ATTACHED\nAUTHORITY_VERIFIED");
assert(executionReady.escalationState === "ALLOW_TO_EXECUTE", "activation-ready with proof should allow execute");

const missingProof = classifyPTECEscalation("SIGNAL_KIND: ALLOW\nACTION: CREATE_LIVE_SYSTEM_RECORD");
assert(missingProof.escalationState === "HELD", "missing proof should hold");

const paccReview = classifyPTECEscalation("SIGNAL_KIND: ALLOW\nPACC REVIEW");
assert(paccReview.escalationState === "ESCALATION_REQUIRED", "PACC REVIEW should escalate");

const paccLock = classifyPTECEscalation("SIGNAL_KIND: ALLOW\nPACC LOCK");
assert(paccLock.escalationState === "REJECTED", "PACC LOCK should reject");

const duplicate = classifyPTECEscalation("SIGNAL_KIND: ALLOW\nDUPLICATE_RISK");
assert(duplicate.escalationState === "HELD", "duplicate risk should hold");

console.log("PTEC_ESCALATION_CLASSIFIER=PASS");
console.log("STATE=ALLOW_TO_QUEUE PASS");
console.log("STATE=ALLOW_TO_EXECUTE PASS");
console.log("STATE=HELD PASS");
console.log("STATE=ESCALATION_REQUIRED PASS");
console.log("STATE=REJECTED PASS");
console.log("NO_RUNTIME_WIRING=PASS");
