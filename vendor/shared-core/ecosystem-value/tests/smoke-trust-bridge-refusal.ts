import { validateSharedSettlementForReceiving } from "../src/index.js";

const malformed = {
  settlementId: "bad_001",
  merchantId: "merchant_bad",
  status: "settled",
};

const incoming = validateSharedSettlementForReceiving({
  incoming: malformed,
});

if (incoming.accepted || incoming.decision !== "REFUSED_MALFORMED") {
  throw new Error(`Expected REFUSED_MALFORMED, received ${incoming.decision}`);
}

console.log("SMOKE_SHARED_VALUE_TO_SHARED_TRUST_REFUSAL=PASS");
console.log(`INCOMING_DECISION=${incoming.decision}`);