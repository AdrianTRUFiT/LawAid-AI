import { evaluateAuthorization } from "../src/index.js";

const result = evaluateAuthorization({
  requestId: "auth_001",
  actionType: "assign_slot",
  targetType: "slot",
  targetId: "slot_001",
  requestedBy: "user_a",
  requiredAuthorizationClass: "operator",
  providedAuthorizationClass: "supervisor",
});

if (!result.ok || !result.result || !result.result.authorized || result.result.decision !== "APPROVED") {
  throw new Error("Expected approved authorization.");
}

console.log("SMOKE_AUTHORIZATION_GATE_APPROVED=PASS");