import { evaluateAuthorization } from "../src/index.js";

const result = evaluateAuthorization({
  requestId: "auth_005",
  actionType: "",
  targetType: "slot",
  targetId: "slot_005",
  requestedBy: "user_e",
  requiredAuthorizationClass: "operator",
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_ACTION") {
  throw new Error("Expected invalid action refusal.");
}

console.log("SMOKE_AUTHORIZATION_GATE_INVALID=PASS");