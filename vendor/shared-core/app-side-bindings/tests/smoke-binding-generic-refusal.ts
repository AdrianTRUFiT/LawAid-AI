import { bindGenericView } from "../src/index.js";

const bound = bindGenericView({
  routed: false,
  decision: "REFUSED_COMPLIANCE",
  reason: "Compliance failed.",
  districtPacket: null,
  snapshot: {
    complianceTrusted: false,
    complianceReleased: false,
    settlementTrusted: false,
    activationTrusted: false,
    received: false,
    districtAccepted: false,
    districtType: "GENERIC",
  },
});

if (bound.bound || bound.viewModel.active) {
  throw new Error("Expected generic binding refusal.");
}

console.log("SMOKE_APP_BINDING_GENERIC_REFUSAL=PASS");