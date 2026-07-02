import {
  createLawAidAIPadsPaidState,
  verifyLawAidAIPadsPaidState
} from "../src/launch-ux/lawaidaiPadsPaidState.js";

const state = createLawAidAIPadsPaidState();
const result = verifyLawAidAIPadsPaidState(state);

if (!result.accepted) {
  console.error("LAWAIDAI_PADS_PAID_UX_UPDATE=FAIL");
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log("LAWAIDAI_PADS_PAID_UX_UPDATE=PASS");
for (const [k,v] of Object.entries(result.checks)) {
  console.log(`${k}=${v ? "PASS" : "FAIL"}`);
}
console.log("HEADLINE=" + state.copy.headline);
console.log("IDENTITY_REFERENCE=" + state.identityLayer.identityReference);
console.log("PAID_STATE=" + state.paid.status);