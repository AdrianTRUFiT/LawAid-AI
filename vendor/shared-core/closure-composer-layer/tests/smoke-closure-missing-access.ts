import { runClosureComposer } from "../src/index.js";

const result = runClosureComposer({
  subjectId: "user_305",
  lifecycleState: "ARCHIVED",
  accessRecord: null,
});

if (result.ok || result.refusal?.refusalCode !== "MISSING_ACCESS_RECORD") {
  throw new Error("Expected missing-access-record refusal.");
}

console.log("SMOKE_CLOSURE_MISSING_ACCESS=PASS");