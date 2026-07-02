import { evaluateAuthorization } from "../src/index.js";

const result = evaluateAuthorization({
  requestId: "auth_003",
  actionType: "override_block",
  targetType: "slot",
  targetId: "slot_003",
  requestedBy: "user_c",
  requiredAuthorizationClass: "system_admin",
  providedAuthorizationClass: "operator",
});

if (result.ok || result.refusal?.refusalCode !== "INSUFFICIENT_AUTHORIZATION") {
  throw new Error("Expected insufficient authorization refusal.");
}

console.log("SMOKE_AUTHORIZATION_GATE_INSUFFICIENT=PASS");