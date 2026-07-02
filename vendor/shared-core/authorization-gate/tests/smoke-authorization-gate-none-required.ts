import { evaluateAuthorization } from "../src/index.js";

const result = evaluateAuthorization({
  requestId: "auth_004",
  actionType: "read_slot",
  targetType: "slot",
  targetId: "slot_004",
  requestedBy: "user_d",
  requiredAuthorizationClass: "none",
});

if (!result.ok || !result.result || result.result.decision !== "APPROVED") {
  throw new Error("Expected no-auth approval.");
}

console.log("SMOKE_AUTHORIZATION_GATE_NONE_REQUIRED=PASS");