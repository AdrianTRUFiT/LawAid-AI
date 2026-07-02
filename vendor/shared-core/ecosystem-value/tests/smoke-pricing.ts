import { buildRealValuePrice } from "../src/index.js";

const price = buildRealValuePrice({
  merchantId: "merchant_001",
  realValueUnits: 10,
  displayCurrency: "USD",
  settlementCurrency: "USD",
  realValueToDisplayRate: 2.5,
  realValueToSettlementRate: 2.5,
});

if (price.displayAmount !== 25 || price.settlementAmount !== 25) {
  throw new Error("Expected price amounts to equal 25.");
}

console.log("SMOKE_SHARED_VALUE_PRICING=PASS");
