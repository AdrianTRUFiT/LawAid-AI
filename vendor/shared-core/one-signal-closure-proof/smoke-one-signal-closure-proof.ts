import { runOneSignalClosureProof } from './oneSignalClosureProof';

const result = runOneSignalClosureProof();

console.log("ONE_SIGNAL_CLOSURE_PROOF_V1=START");
console.log(JSON.stringify(result, null, 2));

const expected = [
  "RAW_SIGNAL",
  "CAPTURED_SIGNAL",
  "VERIFIED_OPPORTUNITY",
  "ACTIVATED_TRANSACTION_STATE",
  "LIVE_SYSTEM_RECORD"
];

const actual = result.artifacts.map(a => a.type);
const sequenceOk = JSON.stringify(expected) === JSON.stringify(actual);
const sameLiveRecord =
  result.userView.source === result.operatorView.source;

const refusalOk =
  result.operatorView.refusalTest.status === "REFUSED" &&
  result.operatorView.refusalTest.reason === "INVALID_ARTIFACT_SEQUENCE";

const hashOk =
  result.rootHash &&
  result.artifactGraph.every(a => !!a.hash);

console.log("---- VERIFICATION ----");
console.log({
  sequenceOk,
  sameLiveRecord,
  refusalOk,
  hashOk,
  closureState: result.closureState
});

if (!sequenceOk || !sameLiveRecord || !refusalOk || !hashOk || result.closureState !== "CLOSED") {
  throw new Error("ONE_SIGNAL_CLOSURE_PROOF_FAILED");
}

console.log("ONE_SIGNAL_CLOSURE_PROOF_V1=PASS");
console.log("ONE_SIGNAL_CLOSURE_PROOF_V1=COMPLETE");
