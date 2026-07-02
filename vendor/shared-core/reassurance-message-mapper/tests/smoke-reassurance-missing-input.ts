import { runReassuranceMessageMapper } from "../src/index.js";

const result = runReassuranceMessageMapper({
  subjectId: "msg_006",
  accessActivation: null,
});

if (result.ok || result.refusal?.refusalCode !== "MISSING_INPUT") {
  throw new Error("Expected missing-input refusal.");
}

console.log("SMOKE_REASSURANCE_MISSING_INPUT=PASS");