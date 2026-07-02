import { evaluateAuthorization } from "../src/index.js";

const result = evaluateAuthorization({
  requestId: "auth_002",
  actionType: "assign_slot",
  targetType: "slot",
  targetId: "slot_002",
  requestedBy: "user_b",
  requiredAuthorizationClass: "supervisor",
});

if (result.ok || result.refusal?.refusalCode !== "AUTHORIZATION_MISSING") {
  throw new Error("Expected missing authorization refusal.");
}

console.log("SMOKE_AUTHORIZATION_GATE_MISSING=PASS");